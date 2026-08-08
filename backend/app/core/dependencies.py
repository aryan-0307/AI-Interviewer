"""
FastAPI Dependency Injection.

Provides singleton service instances to route handlers via Depends().
All services are initialised once at startup and shared across requests.
"""

from __future__ import annotations

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger
from app.embeddings.embedding_service import EmbeddingService
from app.interview.interview_service import InterviewService
from app.interview.report_service import ReportService
from app.memory.session_manager import SessionManager
from app.retrieval.pinecone_service import PineconeService
from app.services.groq_service import GroqService

logger = get_logger("core.dependencies")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Singleton holders (populated at startup)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_groq_service: GroqService | None = None
_embedding_service: EmbeddingService | None = None
_pinecone_service: PineconeService | None = None
_session_manager: SessionManager | None = None
_interview_service: InterviewService | None = None
_report_service: ReportService | None = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Lifecycle
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def init_services() -> None:
    """
    Initialise all services.  Called once from the FastAPI lifespan.

    Order matters — downstream services depend on upstream ones.
    """
    global _groq_service, _embedding_service, _pinecone_service
    global _session_manager, _interview_service, _report_service

    settings = get_settings()

    logger.info("Initialising services...")

    # 1. Core services
    _groq_service = GroqService(settings)
    _embedding_service = EmbeddingService(settings)
    _session_manager = SessionManager()

    # 2. Pinecone (depends on embedding service)
    _pinecone_service = PineconeService(settings, _embedding_service)
    await _pinecone_service.initialize()

    # 3. Interview orchestration (depends on everything above)
    _interview_service = InterviewService(
        groq_service=_groq_service,
        pinecone_service=_pinecone_service,
        session_manager=_session_manager,
        settings=settings,
    )

    _report_service = ReportService(
        groq_service=_groq_service,
        session_manager=_session_manager,
        settings=settings,
    )

    logger.info("All services initialised ✓")


async def shutdown_services() -> None:
    """Cleanup on application shutdown."""
    global _groq_service
    if _groq_service:
        await _groq_service.close()
    logger.info("Services shut down ✓")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Dependency providers (used in Depends())
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_groq() -> GroqService:
    """Provide the GroqService singleton."""
    assert _groq_service is not None, "GroqService not initialised"
    return _groq_service


def get_embedding() -> EmbeddingService:
    """Provide the EmbeddingService singleton."""
    assert _embedding_service is not None, "EmbeddingService not initialised"
    return _embedding_service


def get_pinecone() -> PineconeService:
    """Provide the PineconeService singleton."""
    assert _pinecone_service is not None, "PineconeService not initialised"
    return _pinecone_service


def get_session_manager() -> SessionManager:
    """Provide the SessionManager singleton."""
    assert _session_manager is not None, "SessionManager not initialised"
    return _session_manager


def get_interview_service() -> InterviewService:
    """Provide the InterviewService singleton."""
    assert _interview_service is not None, "InterviewService not initialised"
    return _interview_service


def get_report_service() -> ReportService:
    """Provide the ReportService singleton."""
    assert _report_service is not None, "ReportService not initialised"
    return _report_service
