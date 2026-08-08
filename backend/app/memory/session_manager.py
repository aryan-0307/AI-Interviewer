"""
In-Memory Interview Session Manager.

Stores all active interview sessions in a dict keyed by session_id.
Thread-safe via asyncio — no database required.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from app.core.logging import get_logger
from app.models.schemas import (
    ConversationTurn,
    Difficulty,
    EvaluationScores,
    InterviewSession,
    InterviewStatus,
)

logger = get_logger("memory.session_manager")


class SessionManager:
    """Manages all interview sessions in memory."""

    def __init__(self) -> None:
        self._sessions: dict[str, InterviewSession] = {}
        logger.info("SessionManager initialised (in-memory)")

    # ── CRUD ───────────────────────────────────

    def create_session(self, candidate_id: str) -> InterviewSession:
        """Create and register a new interview session."""
        session = InterviewSession(
            candidate_id=candidate_id,
            status=InterviewStatus.IN_PROGRESS,
        )
        self._sessions[session.session_id] = session
        logger.info(
            "Session created  id=%s  candidate=%s",
            session.session_id,
            candidate_id,
        )
        return session

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Retrieve a session by ID.  Returns None if not found."""
        return self._sessions.get(session_id)

    def get_session_or_raise(self, session_id: str) -> InterviewSession:
        """Retrieve a session by ID or raise ValueError."""
        session = self._sessions.get(session_id)
        if session is None:
            raise ValueError(f"Session not found: {session_id}")
        return session

    def list_sessions(self) -> list[InterviewSession]:
        """Return all sessions."""
        return list(self._sessions.values())

    def delete_session(self, session_id: str) -> bool:
        """Remove a session.  Returns True if it existed."""
        removed = self._sessions.pop(session_id, None)
        if removed:
            logger.info("Session deleted  id=%s", session_id)
        return removed is not None

    # ── Question tracking ──────────────────────

    def set_current_question(
        self,
        session_id: str,
        question: str,
        topic: str,
        difficulty: Difficulty,
        curriculum_day: int | None = None,
        is_follow_up: bool = False,
    ) -> ConversationTurn:
        """
        Record a new question as the current active question.

        Creates a ConversationTurn and appends it to the conversation log.
        Updates tracking lists to prevent duplicate questions/topics.
        """
        session = self.get_session_or_raise(session_id)
        session.question_count += 1
        if is_follow_up:
            session.follow_up_count += 1

        turn = ConversationTurn(
            question_number=session.question_count,
            question=question,
            topic=topic,
            difficulty=difficulty,
            is_follow_up=is_follow_up,
            curriculum_day=curriculum_day,
        )
        session.conversation.append(turn)
        session.current_question = question
        session.current_topic = topic
        session.current_difficulty = difficulty

        # Track asked questions and topics (dedup)
        if question not in session.asked_questions:
            session.asked_questions.append(question)
        if topic and topic not in session.asked_topics:
            session.asked_topics.append(topic)

        # Track curriculum days covered
        if curriculum_day and curriculum_day not in session.covered_curriculum_days:
            session.covered_curriculum_days.append(curriculum_day)

        logger.info(
            "Question set  session=%s  q#=%d  topic=%s  diff=%s  follow_up=%s",
            session_id,
            session.question_count,
            topic,
            difficulty.value,
            is_follow_up,
        )
        return turn

    # ── Answer & Evaluation ────────────────────

    def record_answer(
        self,
        session_id: str,
        answer: str,
        evaluation: EvaluationScores,
        feedback: str,
    ) -> ConversationTurn:
        """
        Record the candidate's answer and evaluation for the current question.

        Updates the last conversation turn with the answer, scores, and feedback.
        """
        session = self.get_session_or_raise(session_id)

        if not session.conversation:
            raise ValueError("No active question to answer.")

        turn = session.conversation[-1]
        turn.answer = answer
        turn.evaluation = evaluation
        turn.feedback = feedback

        logger.info(
            "Answer recorded  session=%s  q#=%d  avg_score=%.1f",
            session_id,
            turn.question_number,
            self._avg_score(evaluation),
        )
        return turn

    # ── Strength / Weakness tracking ───────────

    def update_topics(
        self,
        session_id: str,
        weakness: str | None = None,
        strength: str | None = None,
    ) -> None:
        """Add identified weak or strong topics to the session."""
        session = self.get_session_or_raise(session_id)

        if weakness and weakness not in session.weak_topics:
            session.weak_topics.append(weakness)
            logger.debug("Weakness added  session=%s  topic=%s", session_id, weakness)

        if strength and strength not in session.strong_topics:
            session.strong_topics.append(strength)
            logger.debug("Strength added  session=%s  topic=%s", session_id, strength)

    # ── Difficulty adjustment ──────────────────

    def adjust_difficulty(self, session_id: str, latest_scores: EvaluationScores) -> Difficulty:
        """
        Adjust the interview difficulty based on latest evaluation scores.

        Returns the new difficulty level.
        """
        session = self.get_session_or_raise(session_id)
        avg = self._avg_score(latest_scores)

        difficulty_map: list[tuple[float, Difficulty]] = [
            (4.0, Difficulty.EASY),
            (6.0, Difficulty.MEDIUM),
            (8.0, Difficulty.HARD),
            (10.0, Difficulty.EXPERT),
        ]

        new_difficulty = Difficulty.MEDIUM
        for threshold, level in difficulty_map:
            if avg <= threshold:
                new_difficulty = level
                break

        if new_difficulty != session.current_difficulty:
            logger.info(
                "Difficulty adjusted  session=%s  %s → %s  (avg=%.1f)",
                session_id,
                session.current_difficulty.value,
                new_difficulty.value,
                avg,
            )
        session.current_difficulty = new_difficulty
        return new_difficulty

    # ── Finish interview ───────────────────────

    def finish_session(self, session_id: str) -> InterviewSession:
        """Mark the session as completed."""
        session = self.get_session_or_raise(session_id)
        session.status = InterviewStatus.COMPLETED
        session.finished_at = datetime.utcnow()
        logger.info(
            "Session finished  id=%s  questions=%d  duration=%.0fs",
            session_id,
            session.question_count,
            (session.finished_at - session.created_at).total_seconds(),
        )
        return session

    # ── Query helpers ──────────────────────────

    def get_conversation_as_dicts(self, session_id: str) -> list[dict]:
        """Return conversation turns as plain dicts (for prompt formatting)."""
        session = self.get_session_or_raise(session_id)
        return [turn.model_dump() for turn in session.conversation]

    def get_aggregate_scores(self, session_id: str) -> dict[str, float]:
        """Compute average scores across all evaluated turns."""
        session = self.get_session_or_raise(session_id)
        evaluated = [t for t in session.conversation if t.evaluation]

        if not evaluated:
            return {
                "accuracy": 0, "depth": 0, "communication": 0,
                "confidence": 0, "practical_knowledge": 0, "system_design": 0,
            }

        fields = ["accuracy", "depth", "communication", "confidence", "practical_knowledge", "system_design"]
        n = len(evaluated)
        return {
            field: round(sum(getattr(t.evaluation, field) for t in evaluated) / n, 2)
            for field in fields
        }

    def should_finish(self, session_id: str, min_questions: int, min_days: int) -> bool:
        """Check if the interview meets the minimum completion criteria."""
        session = self.get_session_or_raise(session_id)
        return (
            session.question_count >= min_questions
            and len(session.covered_curriculum_days) >= min_days
        )

    # ── Internal ───────────────────────────────

    @staticmethod
    def _avg_score(scores: EvaluationScores) -> float:
        """Compute the mean of all six scoring dimensions."""
        vals = [
            scores.accuracy, scores.depth, scores.communication,
            scores.confidence, scores.practical_knowledge, scores.system_design,
        ]
        return sum(vals) / len(vals)
