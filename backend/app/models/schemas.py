"""
All Pydantic models & schemas for the AI Interview Agent.

Organised into:
  • API Request / Response schemas
  • LLM structured‑output schemas
  • Interview domain models
  • Scoring & Report models
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Enums
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class NextAction(str, Enum):
    FOLLOW_UP = "follow_up"
    NEW_TOPIC = "new_topic"
    DEEPER = "deeper"
    FINISH = "finish"


class InterviewStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Candidate
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CandidateProfile(BaseModel):
    """A candidate loaded from the JSON data file."""
    id: str
    name: str
    experience_level: str = "mid"
    target_role: str = "AI Engineer"
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    completed_days: list[int] = Field(default_factory=list)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Curriculum
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CurriculumDay(BaseModel):
    """One day of the curriculum."""
    day: int
    title: str
    type: str = ""
    tools: list[str] = Field(default_factory=list)
    objectives: list[str] = Field(default_factory=list)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LLM Structured Outputs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class EvaluationScores(BaseModel):
    """Per-answer evaluation scores (0-10)."""
    accuracy: int = Field(ge=0, le=10)
    depth: int = Field(ge=0, le=10)
    communication: int = Field(ge=0, le=10)
    confidence: int = Field(ge=0, le=10)
    practical_knowledge: int = Field(ge=0, le=10)
    system_design: int = Field(ge=0, le=10)


class QuestionResponse(BaseModel):
    """Structured response from the LLM when generating a question."""
    question: str
    topic: str
    difficulty: Difficulty
    context: str = ""
    curriculum_day: Optional[int] = None


class EvaluationResponse(BaseModel):
    """Structured response from the LLM when evaluating an answer."""
    evaluation: EvaluationScores
    feedback: str
    follow_up: bool
    next_action: NextAction
    follow_up_question: Optional[str] = None
    topic: str
    difficulty: Difficulty
    identified_weakness: Optional[str] = None
    identified_strength: Optional[str] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Conversation Turn
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ConversationTurn(BaseModel):
    """One Q&A exchange in the interview."""
    question_number: int
    question: str
    answer: str = ""
    topic: str = ""
    difficulty: Difficulty = Difficulty.MEDIUM
    evaluation: Optional[EvaluationScores] = None
    feedback: str = ""
    is_follow_up: bool = False
    curriculum_day: Optional[int] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Interview Session (in-memory state)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class InterviewSession(BaseModel):
    """Full in-memory state for one interview."""
    session_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    candidate_id: str
    status: InterviewStatus = InterviewStatus.NOT_STARTED
    current_question: Optional[str] = None
    current_topic: Optional[str] = None
    current_difficulty: Difficulty = Difficulty.MEDIUM
    conversation: list[ConversationTurn] = Field(default_factory=list)
    asked_topics: list[str] = Field(default_factory=list)
    asked_questions: list[str] = Field(default_factory=list)
    weak_topics: list[str] = Field(default_factory=list)
    strong_topics: list[str] = Field(default_factory=list)
    covered_curriculum_days: list[int] = Field(default_factory=list)
    question_count: int = 0
    follow_up_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    finished_at: Optional[datetime] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Scoring & Final Report
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class FinalScores(BaseModel):
    """Aggregated scores across the entire interview."""
    accuracy: float = Field(ge=0, le=10)
    depth: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)
    confidence: float = Field(ge=0, le=10)
    practical_knowledge: float = Field(ge=0, le=10)
    system_design: float = Field(ge=0, le=10)
    overall: float = Field(ge=0, le=10)


class InterviewReport(BaseModel):
    """Final interview report returned to the client."""
    session_id: str
    candidate_id: str
    candidate_name: str
    overall_score: float
    scores: FinalScores
    total_questions: int
    curriculum_days_covered: list[int]
    strengths: list[str]
    weaknesses: list[str]
    missed_concepts: list[str]
    recommended_curriculum_days: list[int]
    interview_summary: str
    improvement_suggestions: list[str]
    conversation_log: list[ConversationTurn]
    duration_seconds: Optional[float] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API Request / Response Schemas
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class StartInterviewRequest(BaseModel):
    candidate_id: str


class StartInterviewResponse(BaseModel):
    session_id: str
    candidate_name: str
    question: str
    topic: str
    difficulty: Difficulty
    question_number: int
    total_questions: int
    message: str = "Interview started. Good luck!"


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


class AnswerResponse(BaseModel):
    session_id: str
    evaluation: EvaluationScores
    feedback: str
    next_question: Optional[str] = None
    topic: str
    difficulty: Difficulty
    question_number: int
    total_questions: int
    is_follow_up: bool
    is_finished: bool = False
    message: str = ""


class FinishInterviewRequest(BaseModel):
    session_id: str


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
