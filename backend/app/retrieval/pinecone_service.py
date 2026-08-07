"""
Pinecone Serverless Vector Store Service.

Handles index creation, curriculum upsert (with skip-if-indexed),
and semantic retrieval of relevant curriculum chunks.
"""

from __future__ import annotations

import asyncio
from typing import Any, Optional

from pinecone import Pinecone, ServerlessSpec

from app.config.settings import Settings, get_settings
from app.core.logging import get_logger
from app.embeddings.embedding_service import EmbeddingService
from app.utils.data_loader import get_curriculum_text_chunks

logger = get_logger("retrieval.pinecone")


class PineconeService:
    """Async-friendly wrapper around the Pinecone client."""

    def __init__(
        self,
        settings: Settings | None = None,
        embedding_service: EmbeddingService | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._embedding_service = embedding_service or EmbeddingService(self._settings)
        self._pc = Pinecone(api_key=self._settings.PINECONE_API_KEY)
        self._index_name = self._settings.PINECONE_INDEX
        self._namespace = self._settings.PINECONE_NAMESPACE
        self._index: Any | None = None
        logger.info(
            "PineconeService initialised  index=%s  namespace=%s",
            self._index_name,
            self._namespace,
        )

    # ── Index management ───────────────────────

    async def _ensure_index(self) -> None:
        """Create the Pinecone index if it does not already exist."""
        existing = await asyncio.to_thread(self._pc.list_indexes)
        existing_names = [idx.name for idx in existing]

        if self._index_name not in existing_names:
            logger.info("Creating Pinecone index '%s' ...", self._index_name)
            await asyncio.to_thread(
                self._pc.create_index,
                name=self._index_name,
                dimension=self._settings.EMBEDDING_DIMENSION,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=self._settings.PINECONE_CLOUD,
                    region=self._settings.PINECONE_REGION,
                ),
            )
            logger.info("Index '%s' created", self._index_name)
        else:
            logger.info("Index '%s' already exists", self._index_name)

        self._index = self._pc.Index(self._index_name)

    def _get_index(self) -> Any:
        """Return the active index handle, raising if not initialised."""
        if self._index is None:
            raise RuntimeError("PineconeService not initialised. Call initialize() first.")
        return self._index

    # ── Initialization (startup) ───────────────

    async def initialize(self) -> None:
        """
        Full startup sequence:
          1. Ensure the index exists.
          2. Check if curriculum is already indexed.
          3. If not, embed and upsert all curriculum chunks.
        """
        await self._ensure_index()

        # Check current vector count in namespace
        stats = await asyncio.to_thread(self._get_index().describe_index_stats)
        ns_stats = stats.get("namespaces", {}).get(self._namespace, {})
        current_count = ns_stats.get("vector_count", 0)

        chunks = get_curriculum_text_chunks()

        if current_count >= len(chunks):
            logger.info(
                "Curriculum already indexed (%d vectors). Skipping upsert.",
                current_count,
            )
            return

        logger.info(
            "Indexing curriculum: %d chunks (current=%d)",
            len(chunks),
            current_count,
        )
        await self._upsert_chunks(chunks)

    async def _upsert_chunks(self, chunks: list[dict[str, Any]]) -> None:
        """Embed and upsert curriculum chunks into Pinecone."""
        texts = [c["text"] for c in chunks]
        embeddings = await self._embedding_service.embed_documents(texts)

        vectors = []
        for chunk, embedding in zip(chunks, embeddings):
            vectors.append({
                "id": chunk["id"],
                "values": embedding,
                "metadata": {**chunk["metadata"], "text": chunk["text"]},
            })

        # Upsert in batches of 50
        batch_size = 50
        index = self._get_index()
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            await asyncio.to_thread(
                index.upsert,
                vectors=batch,
                namespace=self._namespace,
            )
            logger.debug("Upserted batch %d-%d", i + 1, min(i + batch_size, len(vectors)))

        logger.info("Curriculum upsert complete: %d vectors", len(vectors))

    # ── Retrieval ──────────────────────────────

    async def query(
        self,
        query_text: str,
        top_k: int | None = None,
        filter_metadata: Optional[dict[str, Any]] = None,
    ) -> list[dict[str, Any]]:
        """
        Semantic search against the curriculum index.

        Args:
            query_text: Natural language query.
            top_k: Number of results to return.
            filter_metadata: Optional Pinecone metadata filter.

        Returns:
            List of dicts with 'id', 'score', 'text', and 'metadata'.
        """
        k = top_k or self._settings.TOP_K_RETRIEVAL
        query_embedding = await self._embedding_service.embed_query(query_text)

        kwargs: dict[str, Any] = {
            "vector": query_embedding,
            "top_k": k,
            "include_metadata": True,
            "namespace": self._namespace,
        }
        if filter_metadata:
            kwargs["filter"] = filter_metadata

        results = await asyncio.to_thread(self._get_index().query, **kwargs)

        matches: list[dict[str, Any]] = []
        for match in results.get("matches", []):
            metadata = match.get("metadata", {})
            matches.append({
                "id": match["id"],
                "score": match["score"],
                "text": metadata.get("text", ""),
                "metadata": metadata,
            })

        logger.info(
            "Pinecone query  top_k=%d  matches=%d  best_score=%.3f",
            k,
            len(matches),
            matches[0]["score"] if matches else 0.0,
        )
        return matches

    async def get_relevant_context(
        self,
        topic: str,
        difficulty: str = "",
        top_k: int | None = None,
    ) -> str:
        """
        Retrieve and format relevant curriculum context for a given topic.

        Returns a formatted string ready to insert into an LLM prompt.
        """
        query = f"{topic} {difficulty}".strip()
        matches = await self.query(query, top_k=top_k)

        if not matches:
            return "No relevant curriculum context found."

        context_parts: list[str] = []
        for i, m in enumerate(matches, 1):
            context_parts.append(
                f"[{i}] (relevance: {m['score']:.2f})\n{m['text']}"
            )

        return "\n\n".join(context_parts)
