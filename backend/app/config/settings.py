"""
Application configuration module.

Loads all environment variables and exposes them as a typed Settings object
using pydantic-settings. This is the single source of truth for config.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Path Constants
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
DATA_DIR = BASE_DIR / "data"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Groq LLM ───────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MAX_TOKENS: int = 2048
    GROQ_TEMPERATURE: float = 0.4

    # ── Google Generative AI (Embeddings) ──────
    GOOGLE_API_KEY: str = ""
    GOOGLE_EMBEDDING_MODEL: str = "models/gemini-embedding-2"
    EMBEDDING_DIMENSION: int = 3072

    # ── Pinecone Serverless ────────────────────
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "ai-interview-agent"
    PINECONE_CLOUD: str = "aws"
    PINECONE_REGION: str = "us-east-1"
    PINECONE_NAMESPACE: str = "curriculum"

    # ── App ────────────────────────────────────
    APP_ENV: Literal["development", "staging", "production"] = "development"
    APP_TITLE: str = "AI Interview Agent"
    APP_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"

    # ── Interview Defaults ─────────────────────
    MIN_QUESTIONS: int = 8
    MIN_CURRICULUM_DAYS: int = 4
    MAX_QUESTIONS: int = 15
    TOP_K_RETRIEVAL: int = 5

    @property
    def is_dev(self) -> bool:
        return self.APP_ENV == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
