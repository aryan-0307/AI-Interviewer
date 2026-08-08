"""
Interview Report Generation Service.

Generates the final comprehensive interview report by:
  1. Aggregating scores from all conversation turns.
  2. Asking the LLM for qualitative analysis.
  3. Merging both into a structured InterviewReport.
"""

from __future__ import annotations

import json
from typing import Any

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger
from app.memory.session_manager import SessionManager
from app.models.schemas import (
    FinalScores,
    InterviewReport,
    InterviewSession,
)
from app.prompts.templates import GENERATE_REPORT_PROMPT, format_transcript
from app.services.groq_service import GroqService
from app.utils.data_loader import get_candidate_by_id, load_curriculum

logger = get_logger("interview.report")


class ReportService:
    """Generates the final interview report."""

    def __init__(
        self,
        groq_service: GroqService,
        session_manager: SessionManager,
        settings: Settings | None = None,
    ) -> None:
        self._groq = groq_service
        self._sessions = session_manager
        self._settings = settings or get_settings()
        logger.info("ReportService initialised")

    async def generate_report(self, session_id: str) -> InterviewReport:
        """
        Generate a comprehensive final interview report.

        Steps:
          1. Finalise the session.
          2. Compute aggregate scores.
          3. Ask the LLM for qualitative analysis.
          4. Merge everything into an InterviewReport.
        """
        session = self._sessions.get_session_or_raise(session_id)
        self._sessions.finish_session(session_id)

        candidate = get_candidate_by_id(session.candidate_id)
        if candidate is None:
            raise ValueError(f"Candidate not found: {session.candidate_id}")

        # ── Aggregate scores ───────────────────
        agg_scores = self._sessions.get_aggregate_scores(session_id)
        overall = round(sum(agg_scores.values()) / max(len(agg_scores), 1), 2)

        final_scores = FinalScores(
            accuracy=agg_scores.get("accuracy", 0),
            depth=agg_scores.get("depth", 0),
            communication=agg_scores.get("communication", 0),
            confidence=agg_scores.get("confidence", 0),
            practical_knowledge=agg_scores.get("practical_knowledge", 0),
            system_design=agg_scores.get("system_design", 0),
            overall=overall,
        )

        # ── LLM qualitative report ────────────
        llm_report = await self._generate_llm_report(session, candidate, agg_scores)

        # ── Duration ───────────────────────────
        duration = None
        if session.finished_at and session.created_at:
            duration = (session.finished_at - session.created_at).total_seconds()

        # ── Build final report ─────────────────
        report = InterviewReport(
            session_id=session_id,
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            overall_score=overall,
            scores=final_scores,
            total_questions=session.question_count,
            curriculum_days_covered=session.covered_curriculum_days,
            strengths=llm_report.get("strengths", session.strong_topics),
            weaknesses=llm_report.get("weaknesses", session.weak_topics),
            missed_concepts=llm_report.get("missed_concepts", []),
            recommended_curriculum_days=llm_report.get("recommended_curriculum_days", []),
            interview_summary=llm_report.get("interview_summary", "Report generation incomplete."),
            improvement_suggestions=llm_report.get("improvement_suggestions", []),
            conversation_log=session.conversation,
            duration_seconds=duration,
        )

        logger.info(
            "Report generated  session=%s  overall=%.1f  questions=%d",
            session_id,
            overall,
            session.question_count,
        )
        return report

    async def _generate_llm_report(
        self,
        session: InterviewSession,
        candidate: Any,
        agg_scores: dict[str, float],
    ) -> dict[str, Any]:
        """Ask the LLM to generate qualitative report fields."""
        conv_dicts = self._sessions.get_conversation_as_dicts(session.session_id)
        transcript = format_transcript(conv_dicts)

        all_days = [d.day for d in load_curriculum()]
        topics_covered = ", ".join(session.asked_topics) or "None"

        prompt = GENERATE_REPORT_PROMPT.format(
            candidate_name=candidate.name,
            target_role=candidate.target_role,
            experience_level=candidate.experience_level,
            transcript=transcript,
            aggregate_scores=json.dumps(agg_scores, indent=2),
            topics_covered=topics_covered,
            weak_topics=", ".join(session.weak_topics) or "None",
            strong_topics=", ".join(session.strong_topics) or "None",
            covered_days=", ".join(str(d) for d in session.covered_curriculum_days),
            all_days=", ".join(str(d) for d in all_days),
        )

        try:
            raw = await self._groq.generate_text(prompt, temperature=0.3)
            data = self._groq._extract_json(raw)
            logger.info("LLM report generated successfully")
            return data
        except Exception as exc:
            logger.error("LLM report generation failed: %s", exc)
            # Return safe fallback so the report still works
            return {
                "strengths": session.strong_topics,
                "weaknesses": session.weak_topics,
                "missed_concepts": [],
                "recommended_curriculum_days": [],
                "interview_summary": (
                    f"Interview completed with {session.question_count} questions "
                    f"covering {len(session.covered_curriculum_days)} curriculum days. "
                    f"Overall score: {sum(agg_scores.values()) / max(len(agg_scores), 1):.1f}/10."
                ),
                "improvement_suggestions": [
                    "Review weak topics identified during the interview.",
                ],
            }
