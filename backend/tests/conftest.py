"""
Pytest configuration and shared fixtures.

Provides:
  - AsyncClient for testing FastAPI endpoints
  - Isolated service instances for unit tests
  - Mock fixtures for external APIs (Groq, Pinecone, Google)
"""

from __future__ import annotations

from typing import AsyncIterator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.config.settings import Settings
from app.memory.session_manager import SessionManager
from app.models.schemas import (
    Difficulty,
    EvaluationResponse,
    EvaluationScores,
    NextAction,
    QuestionResponse,
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Settings
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def test_settings() -> Settings:
    """Provide test settings with dummy API keys."""
    return Settings(
        GROQ_API_KEY="test-groq-key",
        GOOGLE_API_KEY="test-google-key",
        PINECONE_API_KEY="test-pinecone-key",
        PINECONE_INDEX="test-index",
        APP_ENV="development",
        LOG_LEVEL="DEBUG",
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Session Manager (no mocking needed)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def session_manager() -> SessionManager:
    """Provide a fresh SessionManager for each test."""
    return SessionManager()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mock LLM Responses
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def mock_question_response() -> QuestionResponse:
    """A realistic mock question from the LLM."""
    return QuestionResponse(
        question="Explain how self-attention works in a Transformer architecture and why it is preferred over RNN-based sequence modelling.",
        topic="Transformer Architecture",
        difficulty=Difficulty.MEDIUM,
        context="Testing deep learning fundamentals on Day 3 curriculum",
        curriculum_day=3,
    )


@pytest.fixture
def mock_evaluation_response() -> EvaluationResponse:
    """A realistic mock evaluation from the LLM."""
    return EvaluationResponse(
        evaluation=EvaluationScores(
            accuracy=7,
            depth=6,
            communication=8,
            confidence=7,
            practical_knowledge=6,
            system_design=5,
        ),
        feedback="Good understanding of the attention mechanism. Consider elaborating on computational complexity and how multi-head attention enables the model to attend to different representation subspaces.",
        follow_up=True,
        next_action=NextAction.FOLLOW_UP,
        follow_up_question="How does multi-head attention differ from single-head attention, and what are the practical benefits?",
        topic="Transformer Architecture",
        difficulty=Difficulty.MEDIUM,
        identified_weakness="System Design",
        identified_strength="Communication",
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mock Groq Service
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def mock_groq_service(mock_question_response, mock_evaluation_response):
    """Provide a mock GroqService that returns canned responses."""
    service = MagicMock()
    service.generate_structured = AsyncMock(
        side_effect=lambda prompt, response_model, **kw: (
            mock_question_response if response_model == QuestionResponse
            else mock_evaluation_response
        )
    )
    service.generate_text = AsyncMock(return_value='{"overall_score": 7.0, "strengths": ["Communication"], "weaknesses": ["System Design"], "missed_concepts": ["KV Cache"], "recommended_curriculum_days": [4], "interview_summary": "Good interview.", "improvement_suggestions": ["Study system design patterns."]}')
    service._extract_json = MagicMock(side_effect=lambda text: __import__("json").loads(text))
    service.close = AsyncMock()
    return service


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mock Pinecone Service
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.fixture
def mock_pinecone_service():
    """Provide a mock PineconeService that returns static context."""
    service = MagicMock()
    service.initialize = AsyncMock()
    service.query = AsyncMock(return_value=[
        {
            "id": "day3_topic2",
            "score": 0.92,
            "text": "Day 3: NLP\nTopic: Transformer Architecture\nKey Concepts: self-attention, multi-head attention, positional encoding",
            "metadata": {"day": 3, "topic": "Transformer Architecture"},
        }
    ])
    service.get_relevant_context = AsyncMock(
        return_value="[1] (relevance: 0.92)\nDay 3: NLP\nTopic: Transformer Architecture\nKey Concepts: self-attention, multi-head attention, positional encoding"
    )
    return service


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Async HTTP Client (for API tests)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest_asyncio.fixture
async def client(
    mock_groq_service,
    mock_pinecone_service,
    session_manager,
) -> AsyncIterator[AsyncClient]:
    """
    Provide an httpx AsyncClient wired to the FastAPI app
    with all external services mocked.
    """
    from app.core import dependencies as deps

    # Inject mocks into the dependency module
    deps._groq_service = mock_groq_service
    deps._pinecone_service = mock_pinecone_service
    deps._session_manager = session_manager
    deps._embedding_service = MagicMock()

    from app.interview.interview_service import InterviewService
    from app.interview.report_service import ReportService

    deps._interview_service = InterviewService(
        groq_service=mock_groq_service,
        pinecone_service=mock_pinecone_service,
        session_manager=session_manager,
    )
    deps._report_service = ReportService(
        groq_service=mock_groq_service,
        session_manager=session_manager,
    )

    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Cleanup
    deps._groq_service = None
    deps._pinecone_service = None
    deps._session_manager = None
    deps._embedding_service = None
    deps._interview_service = None
    deps._report_service = None
