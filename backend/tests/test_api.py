"""
API endpoint tests.

Tests all routes using the mocked FastAPI client from conftest.
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Health
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """GET /health should return 200 with status='healthy'."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Curriculum
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_get_curriculum(client: AsyncClient) -> None:
    """GET /curriculum should return the full curriculum list."""
    response = await client.get("/curriculum")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 31
    # Check structure of first day
    day1 = data[0]
    assert day1["day"] == 1
    assert "title" in day1
    assert "type" in day1
    assert "tools" in day1


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Candidates
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_get_candidate_found(client: AsyncClient) -> None:
    """GET /candidate/{id} should return 200 for a valid candidate."""
    response = await client.get("/candidate/CAND-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "CAND-001"
    assert data["name"] == "Sarah Johnson"
    assert "completed_days" in data
    assert "strengths" in data


@pytest.mark.asyncio
async def test_get_candidate_not_found(client: AsyncClient) -> None:
    """GET /candidate/{id} should return 404 for unknown candidate."""
    response = await client.get("/candidate/nonexistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Start Interview
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_start_interview_success(client: AsyncClient) -> None:
    """POST /interview/start should create a session and return the first question."""
    response = await client.post(
        "/interview/start",
        json={"candidate_id": "CAND-001"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["candidate_name"] == "Sarah Johnson"
    assert "question" in data
    assert data["question_number"] == 1
    assert data["difficulty"] in ["easy", "medium", "hard", "expert"]
    assert "topic" in data


@pytest.mark.asyncio
async def test_start_interview_invalid_candidate(client: AsyncClient) -> None:
    """POST /interview/start with bad candidate should return 404."""
    response = await client.post(
        "/interview/start",
        json={"candidate_id": "nonexistent"},
    )
    assert response.status_code == 404


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Submit Answer
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_submit_answer_success(client: AsyncClient) -> None:
    """POST /interview/answer should evaluate the answer and return next question."""
    # Start an interview first
    start_resp = await client.post(
        "/interview/start",
        json={"candidate_id": "CAND-001"},
    )
    session_id = start_resp.json()["session_id"]

    # Submit an answer
    response = await client.post(
        "/interview/answer",
        json={
            "session_id": session_id,
            "answer": "Self-attention computes attention weights between all positions in a sequence simultaneously, allowing the model to capture long-range dependencies without the sequential bottleneck of RNNs.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert "evaluation" in data
    assert "feedback" in data
    assert data["question_number"] >= 2
    # Check evaluation scores
    ev = data["evaluation"]
    for key in ["accuracy", "depth", "communication", "confidence", "practical_knowledge", "system_design"]:
        assert 1 <= ev[key] <= 10


@pytest.mark.asyncio
async def test_submit_answer_invalid_session(client: AsyncClient) -> None:
    """POST /interview/answer with bad session should return 404."""
    response = await client.post(
        "/interview/answer",
        json={"session_id": "bad-session", "answer": "test"},
    )
    assert response.status_code == 404


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Session
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_get_session(client: AsyncClient) -> None:
    """GET /session/{id} should return the session state."""
    # Start interview
    start_resp = await client.post(
        "/interview/start",
        json={"candidate_id": "CAND-002"},
    )
    session_id = start_resp.json()["session_id"]

    # Fetch session
    response = await client.get(f"/session/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert data["candidate_id"] == "CAND-002"
    assert data["status"] == "in_progress"
    assert data["question_count"] == 1
    assert len(data["conversation"]) == 1


@pytest.mark.asyncio
async def test_get_session_not_found(client: AsyncClient) -> None:
    """GET /session/{id} should return 404 for unknown session."""
    response = await client.get("/session/nonexistent")
    assert response.status_code == 404


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Finish Interview
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@pytest.mark.asyncio
async def test_finish_interview(client: AsyncClient) -> None:
    """POST /interview/finish should generate a complete report."""
    # Start interview
    start_resp = await client.post(
        "/interview/start",
        json={"candidate_id": "CAND-001"},
    )
    session_id = start_resp.json()["session_id"]

    # Submit a few answers
    for _ in range(2):
        await client.post(
            "/interview/answer",
            json={"session_id": session_id, "answer": "Detailed technical answer."},
        )

    # Finish
    response = await client.post(
        "/interview/finish",
        json={"session_id": session_id},
    )
    assert response.status_code == 200
    report = response.json()
    assert report["session_id"] == session_id
    assert report["candidate_id"] == "CAND-001"
    assert report["candidate_name"] == "Sarah Johnson"
    assert "overall_score" in report
    assert "scores" in report
    assert "strengths" in report
    assert "weaknesses" in report
    assert "missed_concepts" in report
    assert "recommended_curriculum_days" in report
    assert "interview_summary" in report
    assert "improvement_suggestions" in report
    assert "conversation_log" in report
    assert len(report["conversation_log"]) >= 3  # 1 start + 2 answers


@pytest.mark.asyncio
async def test_finish_invalid_session(client: AsyncClient) -> None:
    """POST /interview/finish with bad session should return 404."""
    response = await client.post(
        "/interview/finish",
        json={"session_id": "bad-session"},
    )
    assert response.status_code == 404
