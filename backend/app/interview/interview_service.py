"""
Interview Orchestration Service.

The central engine that drives the adaptive interview flow:
  Start → Generate Question → Receive Answer → Evaluate → Follow-up → Repeat → Report

Coordinates GroqService, PineconeService, and SessionManager.
"""

from __future__ import annotations

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger
from app.memory.session_manager import SessionManager
from app.models.schemas import (
    AnswerResponse,
    CandidateProfile,
    Difficulty,
    EvaluationResponse,
    InterviewSession,
    NextAction,
    QuestionResponse,
    StartInterviewResponse,
)
from app.prompts.templates import (
    EVALUATE_ANSWER_PROMPT,
    GENERATE_QUESTION_PROMPT,
    format_conversation_history,
)
from app.retrieval.pinecone_service import PineconeService
from app.services.groq_service import GroqService
from app.utils.data_loader import get_candidate_by_id, get_curriculum_for_days, load_curriculum

logger = get_logger("interview.service")


class InterviewService:
    """Orchestrates the full interview lifecycle."""

    def __init__(
        self,
        groq_service: GroqService,
        pinecone_service: PineconeService,
        session_manager: SessionManager,
        settings: Settings | None = None,
    ) -> None:
        self._groq = groq_service
        self._pinecone = pinecone_service
        self._sessions = session_manager
        self._settings = settings or get_settings()
        logger.info("InterviewService initialised")

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Start Interview
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async def start_interview(self, candidate_id: str) -> StartInterviewResponse:
        """
        Initialize a new interview session for a candidate.

        1. Load candidate profile.
        2. Create an in-memory session.
        3. Generate the first question (RAG-augmented).
        4. Return the session ID and first question.
        """
        candidate = get_candidate_by_id(candidate_id)
        if candidate is None:
            raise ValueError(f"Candidate not found: {candidate_id}")

        session = self._sessions.create_session(candidate_id)

        logger.info(
            "Starting interview  session=%s  candidate=%s (%s)",
            session.session_id,
            candidate.name,
            candidate.experience_level,
        )

        # Determine starting difficulty from experience level
        difficulty_map = {
            "junior": Difficulty.EASY,
            "mid": Difficulty.MEDIUM,
            "senior": Difficulty.HARD,
        }
        session.current_difficulty = difficulty_map.get(
            candidate.experience_level, Difficulty.MEDIUM
        )

        # Generate first question
        question_data = await self._generate_question(session, candidate)

        # Record the question in session memory
        self._sessions.set_current_question(
            session_id=session.session_id,
            question=question_data.question,
            topic=question_data.topic,
            difficulty=question_data.difficulty,
            curriculum_day=question_data.curriculum_day,
            is_follow_up=False,
        )

        return StartInterviewResponse(
            session_id=session.session_id,
            candidate_name=candidate.name,
            question=question_data.question,
            topic=question_data.topic,
            difficulty=question_data.difficulty,
            question_number=1,
            total_questions=self._settings.MAX_QUESTIONS,
        )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Submit Answer
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async def submit_answer(self, session_id: str, answer: str) -> AnswerResponse:
        """
        Process a candidate's answer:

        1. Evaluate the answer via LLM.
        2. Record answer + evaluation in session memory.
        3. Update weak/strong topics and difficulty.
        4. Decide next action: follow-up, new topic, or finish.
        5. Generate next question if not finished.
        """
        session = self._sessions.get_session_or_raise(session_id)
        candidate = get_candidate_by_id(session.candidate_id)
        if candidate is None:
            raise ValueError(f"Candidate not found: {session.candidate_id}")

        # ── Step 1: Evaluate ───────────────────
        eval_result = await self._evaluate_answer(session, answer)

        # ── Step 2: Record ─────────────────────
        self._sessions.record_answer(
            session_id=session_id,
            answer=answer,
            evaluation=eval_result.evaluation,
            feedback=eval_result.feedback,
        )

        # ── Step 3: Update tracking ────────────
        self._sessions.update_topics(
            session_id=session_id,
            weakness=eval_result.identified_weakness,
            strength=eval_result.identified_strength,
        )
        new_difficulty = self._sessions.adjust_difficulty(
            session_id=session_id,
            latest_scores=eval_result.evaluation,
        )

        # ── Step 4: Decide next action ─────────
        should_finish = self._should_finish_interview(session, eval_result.next_action)

        if should_finish:
            return AnswerResponse(
                session_id=session_id,
                evaluation=eval_result.evaluation,
                feedback=eval_result.feedback,
                next_question=None,
                topic=eval_result.topic,
                difficulty=new_difficulty,
                question_number=session.question_count,
                total_questions=self._settings.MAX_QUESTIONS,
                is_follow_up=False,
                is_finished=True,
                message="Interview complete. Call /interview/finish to generate the report.",
            )

        # ── Step 5: Generate next question ─────
        is_follow_up = eval_result.next_action in (NextAction.FOLLOW_UP, NextAction.DEEPER)

        if is_follow_up and eval_result.follow_up_question:
            next_question_text = eval_result.follow_up_question
            next_topic = eval_result.topic
            next_difficulty = eval_result.difficulty
            curriculum_day = None
        else:
            question_data = await self._generate_question(session, candidate)
            next_question_text = question_data.question
            next_topic = question_data.topic
            next_difficulty = question_data.difficulty
            curriculum_day = question_data.curriculum_day
            is_follow_up = False

        # Record the new question
        self._sessions.set_current_question(
            session_id=session_id,
            question=next_question_text,
            topic=next_topic,
            difficulty=next_difficulty,
            curriculum_day=curriculum_day if not is_follow_up else None,
            is_follow_up=is_follow_up,
        )

        return AnswerResponse(
            session_id=session_id,
            evaluation=eval_result.evaluation,
            feedback=eval_result.feedback,
            next_question=next_question_text,
            topic=next_topic,
            difficulty=next_difficulty,
            question_number=session.question_count,
            total_questions=self._settings.MAX_QUESTIONS,
            is_follow_up=is_follow_up,
            is_finished=False,
        )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Internal: Generate Question
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async def _generate_question(
        self,
        session: InterviewSession,
        candidate: CandidateProfile,
    ) -> QuestionResponse:
        """Build the prompt and call the LLM to generate a question."""

        # Determine what topic to query Pinecone for
        query_topic = self._pick_query_topic(session, candidate)
        curriculum_context = await self._pinecone.get_relevant_context(
            topic=query_topic,
            difficulty=session.current_difficulty.value,
        )

        # Build the conversation history string
        conv_dicts = self._sessions.get_conversation_as_dicts(session.session_id)
        conversation_history = format_conversation_history(conv_dicts)

        # Uncovered days
        all_days = [d.day for d in load_curriculum()]
        covered = session.covered_curriculum_days
        uncovered = [d for d in all_days if d not in covered]

        prompt = GENERATE_QUESTION_PROMPT.format(
            candidate_name=candidate.name,
            target_role=candidate.target_role,
            experience_level=candidate.experience_level,
            completed_days=", ".join(str(d) for d in candidate.completed_days) or "None",
            strengths=", ".join(candidate.strengths) or "None",
            weaknesses=", ".join(candidate.weaknesses) or "None",
            curriculum_context=curriculum_context,
            question_count=session.question_count,
            asked_topics=", ".join(session.asked_topics) or "None",
            weak_topics=", ".join(session.weak_topics) or "None yet",
            strong_topics=", ".join(session.strong_topics) or "None yet",
            current_difficulty=session.current_difficulty.value,
            covered_days=", ".join(str(d) for d in covered) or "None",
            conversation_history=conversation_history,
            min_curriculum_days=self._settings.MIN_CURRICULUM_DAYS,
        )

        result = await self._groq.generate_structured(prompt, QuestionResponse)

        logger.info(
            "Question generated  topic=%s  diff=%s  day=%s",
            result.topic,
            result.difficulty.value,
            result.curriculum_day,
        )
        return result

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Internal: Evaluate Answer
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async def _evaluate_answer(
        self,
        session: InterviewSession,
        answer: str,
    ) -> EvaluationResponse:
        """Build the prompt and call the LLM to evaluate an answer."""

        topic = session.current_topic or "general"
        curriculum_context = await self._pinecone.get_relevant_context(topic=topic)

        conv_dicts = self._sessions.get_conversation_as_dicts(session.session_id)
        conversation_history = format_conversation_history(conv_dicts)

        all_days = [d.day for d in load_curriculum()]
        all_topics = []
        for day in load_curriculum():
            all_topics.append(day.title)
        uncovered = [t for t in all_topics if t not in session.asked_topics]

        prompt = EVALUATE_ANSWER_PROMPT.format(
            question=session.current_question or "",
            topic=topic,
            difficulty=session.current_difficulty.value,
            answer=answer,
            curriculum_context=curriculum_context,
            conversation_history=conversation_history,
            question_count=session.question_count,
            max_questions=self._settings.MAX_QUESTIONS,
            covered_days=", ".join(str(d) for d in session.covered_curriculum_days) or "None",
            min_curriculum_days=self._settings.MIN_CURRICULUM_DAYS,
            uncovered_topics=", ".join(uncovered[:10]) or "All covered",
        )

        result = await self._groq.generate_structured(prompt, EvaluationResponse)

        logger.info(
            "Answer evaluated  topic=%s  accuracy=%d  next=%s  follow_up=%s",
            result.topic,
            result.evaluation.accuracy,
            result.next_action.value,
            result.follow_up,
        )
        return result

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Internal: Decision Helpers
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def _should_finish_interview(
        self,
        session: InterviewSession,
        next_action: NextAction,
    ) -> bool:
        """Determine if the interview should end."""
        # LLM says finish AND minimum criteria met
        if next_action == NextAction.FINISH:
            if self._sessions.should_finish(
                session.session_id,
                self._settings.MIN_QUESTIONS,
                self._settings.MIN_CURRICULUM_DAYS,
            ):
                return True

        # Hard cap on questions
        if session.question_count >= self._settings.MAX_QUESTIONS:
            logger.info("Max questions reached (%d). Finishing.", self._settings.MAX_QUESTIONS)
            return True

        return False

    def _pick_query_topic(
        self,
        session: InterviewSession,
        candidate: CandidateProfile,
    ) -> str:
        """
        Intelligently pick what topic to search Pinecone for.

        Priority:
          1. Weak topics identified during the interview.
          2. Candidate's known weaknesses from their profile.
          3. Uncovered curriculum days.
          4. Fall back to the candidate's target role.
        """
        # Prioritise weak topics found during interview
        interview_weak = [
            t for t in session.weak_topics if t not in session.asked_topics
        ]
        if interview_weak:
            return interview_weak[0]

        # Candidate's profile weaknesses
        profile_weak = [
            w for w in candidate.weaknesses if w not in session.asked_topics
        ]
        if profile_weak:
            return profile_weak[0]

        # Uncovered curriculum days
        all_days = load_curriculum()
        uncovered = [d for d in all_days if d.day not in session.covered_curriculum_days]
        if uncovered:
            # Pick from candidate's completed days first
            for day in uncovered:
                if day.day in candidate.completed_days:
                    return day.title
            return uncovered[0].title

        # Fallback
        return f"{candidate.target_role} technical interview"
