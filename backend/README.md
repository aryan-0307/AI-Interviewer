# 🤖 AI Interview Agent — Backend

An adaptive AI-powered interview system that simulates a **Senior AI Engineer** conducting rigorous technical interviews.

---

## ✨ Features

- **Adaptive Difficulty** — Adjusts question difficulty based on candidate performance (easy → expert)
- **RAG-Augmented Questions** — Retrieves relevant curriculum context from Pinecone before generating each question
- **Follow-Up Probing** — Asks contextual follow-up questions when answers are vague or partially correct
- **6-Dimension Scoring** — Accuracy, Depth, Communication, Confidence, Practical Knowledge, System Design
- **Comprehensive Reports** — Strengths, weaknesses, missed concepts, and improvement suggestions
- **In-Memory Sessions** — No database required; all state lives in memory
- **Structured LLM Output** — Every LLM response is validated against Pydantic models

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI + Uvicorn |
| LLM | Groq API (Llama 3.1 70B) |
| Embeddings | Google Generative AI (text-embedding-004) |
| Vector DB | Pinecone Serverless |
| Validation | Pydantic v2 |
| HTTP Client | Async HTTPX |
| Testing | Pytest + pytest-asyncio |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/            # FastAPI route handlers
│   ├── config/         # Settings & environment config
│   ├── core/           # Logging, dependency injection
│   ├── embeddings/     # Google GenAI embedding service
│   ├── interview/      # Interview & report orchestration
│   ├── memory/         # In-memory session management
│   ├── models/         # Pydantic schemas & models
│   ├── prompts/        # LLM prompt templates
│   ├── retrieval/      # Pinecone vector store service
│   ├── services/       # Groq LLM service
│   └── utils/          # Data loaders
├── data/               # Curriculum, candidates, tech spec JSON
├── tests/              # Pytest test suite
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env
# Edit .env with your API keys:
#   GROQ_API_KEY=gsk_...
#   GOOGLE_API_KEY=...
#   PINECONE_API_KEY=...
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Open Docs

Visit [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/interview/start` | Start a new interview session |
| `POST` | `/interview/answer` | Submit an answer, receive evaluation + next question |
| `POST` | `/interview/finish` | Finish interview, generate comprehensive report |
| `GET` | `/candidate/{id}` | Get candidate profile |
| `GET` | `/curriculum` | Get full curriculum |
| `GET` | `/session/{id}` | Get interview session state |

---

## 🔄 Interview Flow

```
POST /interview/start  { "candidate_id": "candidate_001" }
         │
         ▼
   ┌─────────────┐
   │ First Question │
   └──────┬──────┘
         │
         ▼
POST /interview/answer  { "session_id": "...", "answer": "..." }
         │
         ▼
   ┌─────────────┐
   │  Evaluate    │──► Adjust difficulty
   │  + Feedback  │──► Track strengths/weaknesses
   └──────┬──────┘
         │
         ▼
   ┌─────────────────┐
   │ Next Question    │──► Follow-up or new topic
   │ (RAG-augmented)  │
   └──────┬──────────┘
         │
         ▼
      Repeat (8-15 questions)
         │
         ▼
POST /interview/finish  { "session_id": "..." }
         │
         ▼
   ┌─────────────┐
   │ Final Report │
   └─────────────┘
```

---

## 🐳 Docker

```bash
# Build & run
docker-compose up --build

# Or directly
docker build -t ai-interview-agent .
docker run -p 8000:8000 --env-file .env ai-interview-agent
```

---

## 🧪 Testing

```bash
pytest tests/ -v --cov=app
```

---

## 📄 License

MIT
