"""
FastAPI Application Entry Point.

Creates the app instance, configures lifespan (startup/shutdown),
mounts routes, and adds middleware.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config.settings import get_settings
from app.core.dependencies import init_services, shutdown_services
from app.core.logging import get_logger, setup_logging

logger = get_logger("main")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Lifespan
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan manager.

    Startup:
      1. Configure logging.
      2. Initialise all services (Groq, Pinecone, etc.).

    Shutdown:
      1. Gracefully close services.
    """
    # ── Startup ────────────────────────────────
    setup_logging()
    logger.info("🚀 Starting AI Interview Agent...")

    await init_services()
    logger.info("✅ All systems ready")

    yield

    # ── Shutdown ───────────────────────────────
    logger.info("🛑 Shutting down...")
    await shutdown_services()
    logger.info("👋 Goodbye!")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# App Factory
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=(
            "An adaptive AI-powered interview agent that simulates a "
            "Senior AI Engineer conducting rigorous technical interviews. "
            "Features RAG-augmented question generation, adaptive difficulty, "
            "real-time evaluation, and comprehensive report generation."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ───────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global exception handler ───────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error. Please try again.",
                "error_code": "INTERNAL_ERROR",
            },
        )

    # ── Routes ─────────────────────────────────
    app.include_router(router, prefix="")

    return app


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Application instance
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app = create_app()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Direct run support
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=get_settings().is_dev,
        log_level=get_settings().LOG_LEVEL.lower(),
    )
