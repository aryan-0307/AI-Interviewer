"""
API route definitions.

All endpoints are defined here and mounted onto a single APIRouter.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.config.settings import get_settings
from app.core.dependencies import (
    get_interview_service,
    get_report_service,
    get_session_manager,
)
from app.core.logging import get_logger
from app.interview.interview_service import InterviewService
from app.interview.report_service import ReportService
from app.memory.session_manager import SessionManager
from app.models.schemas import (
    AnswerRequest,
    AnswerResponse,
    CandidateProfile,
    CurriculumDay,
    ErrorResponse,
    FinishInterviewRequest,
    HealthResponse,
    InterviewReport,
    InterviewSession,
    StartInterviewRequest,
    StartInterviewResponse,
)
from app.utils.data_loader import get_candidate_by_id, load_candidates, load_curriculum

logger = get_logger("api.routes")

router = APIRouter()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Health Check
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
)
async def health_check() -> HealthResponse:
    """Return service health status."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Interview Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post(
    "/interview/start",
    response_model=StartInterviewResponse,
    tags=["Interview"],
    summary="Start a new interview session",
    responses={404: {"model": ErrorResponse}},
)
async def start_interview(
    request: StartInterviewRequest,
    service: InterviewService = Depends(get_interview_service),
) -> StartInterviewResponse:
    """
    Start a new adaptive interview for a candidate.

    - Loads the candidate profile.
    - Creates an in-memory session.
    - Generates the first RAG-augmented question.
    """
    try:
        result = await service.start_interview(request.candidate_id)
        logger.info("Interview started  session=%s", result.session_id)
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post(
    "/interview/answer",
    response_model=AnswerResponse,
    tags=["Interview"],
    summary="Submit an answer to the current question",
    responses={404: {"model": ErrorResponse}},
)
async def submit_answer(
    request: AnswerRequest,
    service: InterviewService = Depends(get_interview_service),
) -> AnswerResponse:
    """
    Submit the candidate's answer and receive:

    - Evaluation scores (6 dimensions)
    - Feedback
    - Next question (or finish signal)
    """
    try:
        result = await service.submit_answer(request.session_id, request.answer)
        logger.info(
            "Answer processed  session=%s  q#=%d  finished=%s",
            result.session_id,
            result.question_number,
            result.is_finished,
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post(
    "/interview/finish",
    response_model=InterviewReport,
    tags=["Interview"],
    summary="Finish the interview and generate a report",
    responses={404: {"model": ErrorResponse}},
)
async def finish_interview(
    request: FinishInterviewRequest,
    report_service: ReportService = Depends(get_report_service),
) -> InterviewReport:
    """
    Finish an active interview and generate a comprehensive report.

    Returns overall score, strengths, weaknesses, missed concepts,
    recommended curriculum days, and improvement suggestions.
    """
    try:
        report = await report_service.generate_report(request.session_id)
        logger.info(
            "Report generated  session=%s  overall=%.1f",
            report.session_id,
            report.overall_score,
        )
        return report
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Candidate Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get(
    "/candidate",
    response_model=list[CandidateProfile],
    tags=["Candidates"],
    summary="Get all candidates",
)
async def get_all_candidates() -> list[CandidateProfile]:
    """Retrieve all candidate profiles."""
    return load_candidates()


@router.get(
    "/candidate/{candidate_id}",
    response_model=CandidateProfile,
    tags=["Candidates"],
    summary="Get candidate profile by ID",
    responses={404: {"model": ErrorResponse}},
)
async def get_candidate(candidate_id: str) -> CandidateProfile:
    """Retrieve a candidate's profile by their ID."""
    candidate = get_candidate_by_id(candidate_id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate not found: {candidate_id}",
        )
    return candidate


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Curriculum Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get(
    "/curriculum",
    response_model=list[CurriculumDay],
    tags=["Curriculum"],
    summary="Get the full curriculum",
)
async def get_curriculum() -> list[CurriculumDay]:
    """Return the complete curriculum with all days and topics."""
    return load_curriculum()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Session Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get(
    "/session/{session_id}",
    response_model=InterviewSession,
    tags=["Sessions"],
    summary="Get interview session state",
    responses={404: {"model": ErrorResponse}},
)
async def get_session(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager),
) -> InterviewSession:
    """Retrieve the full state of an interview session."""
    session = session_manager.get_session(session_id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}",
        )
    return session
