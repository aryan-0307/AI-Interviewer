"""
Google Generative AI Embedding Service.

Generates text embeddings using Google's text-embedding-004 model
via the official google-generativeai SDK.  Fully async-compatible
using asyncio.to_thread for the synchronous SDK call.
"""

from __future__ import annotations

import asyncio
from typing import Optional

import google.generativeai as genai

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger

logger = get_logger("embeddings.service")


class EmbeddingService:
    """Generates embeddings using Google Generative AI."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        genai.configure(api_key=self._settings.GOOGLE_API_KEY)
        self._model = self._settings.GOOGLE_EMBEDDING_MODEL
        self._dimension = self._settings.EMBEDDING_DIMENSION
        logger.info(
            "EmbeddingService initialised  model=%s  dim=%d",
            self._model,
            self._dimension,
        )

    # ── Single text ────────────────────────────

    async def embed_text(self, text: str, task_type: Optional[str] = None) -> list[float]:
        """
        Generate an embedding vector for a single text string.

        Args:
            text: The input text to embed.
            task_type: Optional task type hint (e.g. "retrieval_document",
                       "retrieval_query", "semantic_similarity").

        Returns:
            A list of floats representing the embedding vector.
        """
        kwargs: dict = {
            "model": self._model,
            "content": text,
        }
        if task_type:
            kwargs["task_type"] = task_type

        result = await asyncio.to_thread(genai.embed_content, **kwargs)
        embedding: list[float] = result["embedding"]

        logger.debug("Embedded text (%d chars) → %d-dim vector", len(text), len(embedding))
        return embedding

    # ── Batch texts ────────────────────────────

    async def embed_batch(
        self,
        texts: list[str],
        task_type: Optional[str] = None,
        batch_size: int = 20,
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple texts in batches.

        The Google SDK supports batch embedding natively.  We chunk
        into groups of `batch_size` to stay within API limits.

        Args:
            texts: List of input strings.
            task_type: Optional task type hint.
            batch_size: Number of texts per API call.

        Returns:
            A list of embedding vectors, one per input text.
        """
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]

            kwargs: dict = {
                "model": self._model,
                "content": batch,
            }
            if task_type:
                kwargs["task_type"] = task_type

            result = await asyncio.to_thread(genai.embed_content, **kwargs)
            batch_embeddings: list[list[float]] = result["embedding"]
            all_embeddings.extend(batch_embeddings)

            logger.debug(
                "Embedded batch %d-%d / %d",
                i + 1,
                min(i + batch_size, len(texts)),
                len(texts),
            )

        logger.info("Batch embedding complete: %d texts → %d vectors", len(texts), len(all_embeddings))
        return all_embeddings

    # ── Query embedding (convenience) ──────────

    async def embed_query(self, query: str) -> list[float]:
        """Embed a search query with the retrieval_query task type."""
        return await self.embed_text(query, task_type="retrieval_query")

    # ── Document embedding (convenience) ───────

    async def embed_document(self, document: str) -> list[float]:
        """Embed a document chunk with the retrieval_document task type."""
        return await self.embed_text(document, task_type="retrieval_document")

    async def embed_documents(self, documents: list[str]) -> list[list[float]]:
        """Embed multiple document chunks with the retrieval_document task type."""
        return await self.embed_batch(documents, task_type="retrieval_document")
