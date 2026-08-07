"""
Data loader utilities.

Loads curriculum, candidate profiles, and tech spec from JSON files
in the data/ directory.  All data is cached in-memory after first load.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.config.settings import DATA_DIR
from app.core.logging import get_logger
from app.models.schemas import CandidateProfile, CurriculumDay

logger = get_logger("utils.data_loader")


def _load_json(file_path: Path) -> Any:
    """Read and parse a JSON file from disk."""
    if not file_path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %s  (%d items)", file_path.name, len(data) if isinstance(data, list) else 1)
    return data


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Curriculum
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@lru_cache(maxsize=1)
def load_curriculum() -> list[CurriculumDay]:
    """Load and validate the curriculum JSON into typed models."""
    raw = _load_json(DATA_DIR / "curriculum.json")
    days = [CurriculumDay.model_validate(d) for d in raw]
    logger.info("Curriculum loaded: %d days, %d total topics",
                len(days), sum(len(d.topics) for d in days))
    return days


def get_curriculum_for_days(day_numbers: list[int]) -> list[CurriculumDay]:
    """Return only the curriculum days matching the given day numbers."""
    all_days = load_curriculum()
    return [d for d in all_days if d.day in day_numbers]


def get_curriculum_text_chunks() -> list[dict[str, Any]]:
    """
    Split curriculum into text chunks suitable for embedding.

    Each chunk is one topic within a day, containing the topic title,
    description, and all concepts.  Returns a list of dicts with
    'id', 'text', and 'metadata'.
    """
    days = load_curriculum()
    chunks: list[dict[str, Any]] = []

    for day in days:
        for idx, topic in enumerate(day.topics):
            chunk_id = f"day{day.day}_topic{idx}"
            text = (
                f"Day {day.day}: {day.title}\n"
                f"Topic: {topic.title}\n"
                f"Description: {topic.description}\n"
                f"Key Concepts: {', '.join(topic.concepts)}"
            )
            metadata = {
                "day": day.day,
                "day_title": day.title,
                "topic": topic.title,
                "concepts": ", ".join(topic.concepts),
            }
            chunks.append({"id": chunk_id, "text": text, "metadata": metadata})

    logger.info("Generated %d curriculum chunks for embedding", len(chunks))
    return chunks


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Candidates
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@lru_cache(maxsize=1)
def load_candidates() -> list[CandidateProfile]:
    """Load and validate candidate profiles from JSON."""
    raw = _load_json(DATA_DIR / "candidates.json")
    candidates = [CandidateProfile.model_validate(c) for c in raw]
    logger.info("Loaded %d candidate profiles", len(candidates))
    return candidates


def get_candidate_by_id(candidate_id: str) -> CandidateProfile | None:
    """Look up a single candidate by ID.  Returns None if not found."""
    for c in load_candidates():
        if c.id == candidate_id:
            return c
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Tech Spec
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@lru_cache(maxsize=1)
def load_tech_spec() -> dict[str, Any]:
    """Load the technical specification JSON."""
    return _load_json(DATA_DIR / "tech_spec.json")
