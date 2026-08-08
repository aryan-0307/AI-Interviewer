"""
Groq LLM Service.

Reusable async service for all LLM interactions via the Groq API.
Handles JSON parsing, retries, and structured output validation.
"""

from __future__ import annotations

import json
import re
from typing import Any, TypeVar

from groq import AsyncGroq, APIStatusError, RateLimitError
from pydantic import BaseModel, ValidationError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger
from app.prompts.templates import INTERVIEWER_SYSTEM_PROMPT

logger = get_logger("services.groq")

T = TypeVar("T", bound=BaseModel)


class GroqService:
    """Async wrapper around the Groq chat completion API."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = AsyncGroq(api_key=self._settings.GROQ_API_KEY)
        logger.info("GroqService initialised  model=%s", self._settings.GROQ_MODEL)

    # ── Core completion ────────────────────────

    @retry(
        retry=retry_if_exception_type(RateLimitError),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        stop=stop_after_attempt(4),
        reraise=True,
    )
    async def _chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Send a chat completion request and return the raw text response."""
        response = await self._client.chat.completions.create(
            model=self._settings.GROQ_MODEL,
            messages=messages,
            temperature=temperature or self._settings.GROQ_TEMPERATURE,
            max_tokens=max_tokens or self._settings.GROQ_MAX_TOKENS,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or ""
        logger.debug(
            "Groq response  tokens_in=%s  tokens_out=%s",
            response.usage.prompt_tokens if response.usage else "?",
            response.usage.completion_tokens if response.usage else "?",
        )
        return content

    # ── JSON extraction ────────────────────────

    @staticmethod
    def _extract_json(text: str) -> dict[str, Any]:
        """
        Extract a JSON object from potentially messy LLM output.

        Handles:
          - Clean JSON
          - JSON wrapped in ```json ... ``` fences
          - JSON embedded in prose text
        """
        # Try direct parse first
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Strip markdown fences
        cleaned = re.sub(r"```(?:json)?\s*", "", text)
        cleaned = re.sub(r"```\s*$", "", cleaned).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Find first { ... } block
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not extract JSON from LLM response: {text[:200]}")

    # ── Structured output ──────────────────────

    async def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
        system_prompt: str | None = None,
        temperature: float | None = None,
    ) -> T:
        """
        Generate a structured, Pydantic-validated response.

        Args:
            prompt: The user-side prompt.
            response_model: Pydantic model class to validate against.
            system_prompt: Optional system override (defaults to interviewer persona).
            temperature: Optional temperature override.

        Returns:
            A validated instance of response_model.

        Raises:
            ValueError: If the response cannot be parsed or validated after retries.
        """
        messages = [
            {"role": "system", "content": system_prompt or INTERVIEWER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]

        last_error: Exception | None = None

        for attempt in range(3):
            try:
                raw = await self._chat_completion(messages, temperature=temperature)
                data = self._extract_json(raw)
                result = response_model.model_validate(data)
                logger.info(
                    "Structured output OK  model=%s  attempt=%d",
                    response_model.__name__,
                    attempt + 1,
                )
                return result

            except (json.JSONDecodeError, ValueError, ValidationError) as exc:
                last_error = exc
                logger.warning(
                    "Structured output attempt %d failed (%s): %s",
                    attempt + 1,
                    type(exc).__name__,
                    str(exc)[:200],
                )
                # Add a correction hint for the next attempt
                messages.append({"role": "assistant", "content": raw if "raw" in dir() else ""})
                messages.append({
                    "role": "user",
                    "content": (
                        f"Your previous response was not valid JSON matching the schema. "
                        f"Error: {exc}. "
                        f"Please respond with ONLY the correct JSON object, no extra text."
                    ),
                })

            except APIStatusError as exc:
                logger.error("Groq API error: %s", exc)
                raise

        raise ValueError(
            f"Failed to get valid structured output after 3 attempts. "
            f"Last error: {last_error}"
        )

    # ── Simple text generation ─────────────────

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """Generate a plain text response (no schema validation)."""
        messages = [
            {"role": "system", "content": system_prompt or INTERVIEWER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        return await self._chat_completion(messages, temperature=temperature)

    # ── Cleanup ────────────────────────────────

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._client.close()
        logger.info("GroqService closed")
