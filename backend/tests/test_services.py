"""
Unit tests for core services and memory management.

Tests SessionManager, data loaders, and prompt formatting
without any external API calls.
"""

from __future__ import annotations

import pytest

from app.memory.session_manager import SessionManager
from app.models.schemas import (
    CandidateProfile,
    CurriculumDay,
    Difficulty,
    EvaluationScores,
    InterviewStatus,
)
from app.prompts.templates import format_conversation_history, format_transcript
from app.utils.data_loader import (
    get_candidate_by_id,
    get_curriculum_for_days,
    get_curriculum_text_chunks,
    load_candidates,
    load_curriculum,
    load_tech_spec,
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Data Loader Tests
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestDataLoader:
    """Tests for the data loading utilities."""

    def test_load_curriculum(self) -> None:
        """Curriculum should load 8 days with topics."""
        days = load_curriculum()
        assert len(days) == 8
        assert all(isinstance(d, CurriculumDay) for d in days)
        assert days[0].day == 1
        assert len(days[0].topics) >= 1

    def test_load_candidates(self) -> None:
        """Should load 4 candidate profiles."""
        candidates = load_candidates()
        assert len(candidates) == 4
        assert all(isinstance(c, CandidateProfile) for c in candidates)

    def test_get_candidate_by_id(self) -> None:
        """Should find candidate_001."""
        c = get_candidate_by_id("candidate_001")
        assert c is not None
        assert c.name == "Aryan Sharma"
        assert c.experience_level == "mid"

    def test_get_candidate_not_found(self) -> None:
        """Should return None for unknown ID."""
        c = get_candidate_by_id("nonexistent")
        assert c is None

    def test_get_curriculum_for_days(self) -> None:
        """Should filter curriculum by day numbers."""
        filtered = get_curriculum_for_days([1, 3])
        assert len(filtered) == 2
        assert {d.day for d in filtered} == {1, 3}

    def test_get_curriculum_text_chunks(self) -> None:
        """Should produce 24 chunks (8 days × 3 topics)."""
        chunks = get_curriculum_text_chunks()
        assert len(chunks) == 24
        # Check structure
        chunk = chunks[0]
        assert "id" in chunk
        assert "text" in chunk
        assert "metadata" in chunk
        assert "day" in chunk["metadata"]
        assert "topic" in chunk["metadata"]

    def test_load_tech_spec(self) -> None:
        """Tech spec should load as a dict."""
        spec = load_tech_spec()
        assert spec["project"] == "AI Interview Agent"
        assert "interview_rules" in spec


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Session Manager Tests
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestSessionManager:
    """Tests for in-memory session management."""

    def test_create_session(self, session_manager: SessionManager) -> None:
        """Should create a session with a unique ID."""
        session = session_manager.create_session("candidate_001")
        assert session.session_id
        assert session.candidate_id == "candidate_001"
        assert session.status == InterviewStatus.IN_PROGRESS
        assert session.question_count == 0

    def test_get_session(self, session_manager: SessionManager) -> None:
        """Should retrieve a session by ID."""
        created = session_manager.create_session("candidate_001")
        fetched = session_manager.get_session(created.session_id)
        assert fetched is not None
        assert fetched.session_id == created.session_id

    def test_get_session_not_found(self, session_manager: SessionManager) -> None:
        """Should return None for unknown session."""
        assert session_manager.get_session("nonexistent") is None

    def test_get_session_or_raise(self, session_manager: SessionManager) -> None:
        """Should raise ValueError for unknown session."""
        with pytest.raises(ValueError, match="Session not found"):
            session_manager.get_session_or_raise("nonexistent")

    def test_set_current_question(self, session_manager: SessionManager) -> None:
        """Should track question in conversation and update counters."""
        session = session_manager.create_session("candidate_001")
        turn = session_manager.set_current_question(
            session.session_id,
            question="What is backpropagation?",
            topic="Neural Networks",
            difficulty=Difficulty.MEDIUM,
            curriculum_day=2,
        )
        assert turn.question_number == 1
        assert session.question_count == 1
        assert "Neural Networks" in session.asked_topics
        assert 2 in session.covered_curriculum_days
        assert len(session.conversation) == 1

    def test_no_duplicate_topics(self, session_manager: SessionManager) -> None:
        """Should not add duplicate topics."""
        session = session_manager.create_session("candidate_001")
        session_manager.set_current_question(
            session.session_id, "Q1", "RAG", Difficulty.MEDIUM,
        )
        session_manager.set_current_question(
            session.session_id, "Q2", "RAG", Difficulty.HARD,
        )
        assert session.asked_topics.count("RAG") == 1

    def test_record_answer(self, session_manager: SessionManager) -> None:
        """Should record answer and evaluation on the last turn."""
        session = session_manager.create_session("candidate_001")
        session_manager.set_current_question(
            session.session_id, "What is attention?", "Transformers", Difficulty.MEDIUM,
        )
        scores = EvaluationScores(
            accuracy=8, depth=7, communication=9,
            confidence=7, practical_knowledge=6, system_design=5,
        )
        turn = session_manager.record_answer(
            session.session_id,
            answer="Attention is a mechanism...",
            evaluation=scores,
            feedback="Good explanation.",
        )
        assert turn.answer == "Attention is a mechanism..."
        assert turn.evaluation.accuracy == 8
        assert turn.feedback == "Good explanation."

    def test_adjust_difficulty_low_score(self, session_manager: SessionManager) -> None:
        """Low scores should decrease difficulty to EASY."""
        session = session_manager.create_session("candidate_001")
        scores = EvaluationScores(
            accuracy=2, depth=3, communication=3,
            confidence=2, practical_knowledge=3, system_design=2,
        )
        new_diff = session_manager.adjust_difficulty(session.session_id, scores)
        assert new_diff == Difficulty.EASY

    def test_adjust_difficulty_high_score(self, session_manager: SessionManager) -> None:
        """High scores should increase difficulty to EXPERT."""
        session = session_manager.create_session("candidate_001")
        scores = EvaluationScores(
            accuracy=9, depth=9, communication=9,
            confidence=9, practical_knowledge=9, system_design=9,
        )
        new_diff = session_manager.adjust_difficulty(session.session_id, scores)
        assert new_diff == Difficulty.EXPERT

    def test_finish_session(self, session_manager: SessionManager) -> None:
        """Should mark session as completed with a timestamp."""
        session = session_manager.create_session("candidate_001")
        finished = session_manager.finish_session(session.session_id)
        assert finished.status == InterviewStatus.COMPLETED
        assert finished.finished_at is not None

    def test_aggregate_scores(self, session_manager: SessionManager) -> None:
        """Should correctly average scores across turns."""
        session = session_manager.create_session("candidate_001")
        session_manager.set_current_question(
            session.session_id, "Q1", "Topic1", Difficulty.MEDIUM,
        )
        session_manager.record_answer(
            session.session_id, "A1",
            EvaluationScores(accuracy=8, depth=6, communication=8, confidence=7, practical_knowledge=6, system_design=5),
            "OK",
        )
        session_manager.set_current_question(
            session.session_id, "Q2", "Topic2", Difficulty.MEDIUM,
        )
        session_manager.record_answer(
            session.session_id, "A2",
            EvaluationScores(accuracy=6, depth=8, communication=6, confidence=7, practical_knowledge=8, system_design=9),
            "Good",
        )
        agg = session_manager.get_aggregate_scores(session.session_id)
        assert agg["accuracy"] == 7.0
        assert agg["depth"] == 7.0
        assert agg["system_design"] == 7.0

    def test_should_finish(self, session_manager: SessionManager) -> None:
        """Should return True only when min criteria are met."""
        session = session_manager.create_session("candidate_001")
        assert not session_manager.should_finish(session.session_id, 8, 4)

        # Add enough questions and days
        for i in range(8):
            session_manager.set_current_question(
                session.session_id,
                f"Q{i+1}", f"Topic{i+1}", Difficulty.MEDIUM,
                curriculum_day=(i % 4) + 1,
            )
        assert session_manager.should_finish(session.session_id, 8, 4)

    def test_update_topics(self, session_manager: SessionManager) -> None:
        """Should track weak and strong topics without duplicates."""
        session = session_manager.create_session("candidate_001")
        session_manager.update_topics(session.session_id, weakness="RAG")
        session_manager.update_topics(session.session_id, weakness="RAG")
        session_manager.update_topics(session.session_id, strength="NLP")
        assert session.weak_topics == ["RAG"]
        assert session.strong_topics == ["NLP"]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Prompt Template Tests
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestPromptTemplates:
    """Tests for prompt formatting helpers."""

    def test_format_conversation_history_empty(self) -> None:
        """Empty conversation should return placeholder."""
        result = format_conversation_history([])
        assert "No previous conversation" in result

    def test_format_conversation_history_with_turns(self) -> None:
        """Should format turns with Q/A/Feedback."""
        turns = [
            {"question_number": 1, "question": "What is RAG?", "answer": "It combines retrieval with generation.", "feedback": "Good."},
            {"question_number": 2, "question": "Explain embeddings.", "answer": "Dense vector representations.", "feedback": "Solid."},
        ]
        result = format_conversation_history(turns)
        assert "Q1:" in result
        assert "A1:" in result
        assert "Q2:" in result
        assert "What is RAG?" in result

    def test_format_conversation_history_truncates(self) -> None:
        """Should only include the last max_turns."""
        turns = [{"question_number": i, "question": f"Q{i}", "answer": f"A{i}"} for i in range(10)]
        result = format_conversation_history(turns, max_turns=3)
        assert "Q8:" in result
        assert "Q1:" not in result

    def test_format_transcript(self) -> None:
        """Should format full transcript with scores."""
        turns = [
            {
                "question_number": 1,
                "question": "What is attention?",
                "answer": "A mechanism.",
                "topic": "Transformers",
                "difficulty": "medium",
                "evaluation": {"accuracy": 7, "depth": 6},
                "feedback": "Good.",
            },
        ]
        result = format_transcript(turns)
        assert "Question 1" in result
        assert "Transformers" in result
        assert "accuracy=7" in result

    def test_format_transcript_empty(self) -> None:
        """Empty conversation should return placeholder."""
        result = format_transcript([])
        assert "No conversation" in result
