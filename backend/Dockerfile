# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI Interview Agent — Dockerfile
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ── Install dependencies ──────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Copy application code ─────────────────
COPY . .

# ── Expose port ───────────────────────────
EXPOSE 8000

# ── Health check ──────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import os, httpx; port = os.environ.get('PORT', 8000); r = httpx.get(f'http://localhost:{port}/health'); r.raise_for_status()"

# ── Run ───────────────────────────────────
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
