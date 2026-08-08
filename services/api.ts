import {
  Candidate,
  CurriculumTopic,
  StartInterviewRequest,
  StartInterviewResponse,
  AnswerInterviewRequest,
  AnswerInterviewResponse,
  FinishInterviewRequest,
  InterviewReport,
} from "@/types/interview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Default Mock Data for Instant Demonstration / Offline Mode
export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    name: "Alex Rivera",
    role: "Senior Full Stack Engineer",
    experience: "6 Years",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skills: ["React 19", "Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    completedMissions: 14,
    overallScore: 92,
    status: "Ready",
    bio: "Passionate engineer specialized in high-throughput distributed frontend applications & modern AI integrations.",
  },
  {
    id: "cand-2",
    name: "Elena Rostova",
    role: "AI / ML Infrastructure Lead",
    experience: "8 Years",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    skills: ["PyTorch", "LLMs", "LangChain", "Vector DBs", "CUDA", "Kubernetes"],
    completedMissions: 22,
    overallScore: 96,
    status: "Ready",
    bio: "AI researcher turned infrastructure architect with deep expertise in optimizing inference latency for custom LLMs.",
  },
  {
    id: "cand-3",
    name: "Marcus Vance",
    role: "Backend & Systems Architect",
    experience: "5 Years",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    skills: ["Go", "Rust", "gRPC", "Kafka", "Redis", "Distributed Systems"],
    completedMissions: 9,
    overallScore: 88,
    status: "Ready",
    bio: "Systems specialist focused on microservice resilience, low-latency queues, and cloud native database design.",
  },
  {
    id: "cand-4",
    name: "Sophia Chen",
    role: "Lead Product Designer & UX Engineer",
    experience: "7 Years",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    skills: ["Design Systems", "Framer Motion", "Tailwind CSS", "User Research", "Accessibility"],
    completedMissions: 18,
    overallScore: 94,
    status: "Ready",
    bio: "Pioneer in micro-interactions, dark mode aesthetics, and human-centric AI UI paradigms.",
  },
];

export const MOCK_CURRICULUM: CurriculumTopic[] = [
  {
    id: "curr-1",
    name: "Next.js 15 App Router & Server Actions",
    category: "Frontend Architecture",
    coveragePercentage: 95,
    status: "Mastered",
    recommendedDays: 1,
  },
  {
    id: "curr-2",
    name: "State Management with Zustand & React Query",
    category: "Client Side Logic",
    coveragePercentage: 88,
    status: "Mastered",
    recommendedDays: 2,
  },
  {
    id: "curr-3",
    name: "Async Streaming & SSE Latency Tuning",
    category: "AI Backend & Networking",
    coveragePercentage: 74,
    status: "In Progress",
    recommendedDays: 3,
  },
  {
    id: "curr-4",
    name: "Tailwind CSS Design Systems & Motion UX",
    category: "Design & UX",
    coveragePercentage: 92,
    status: "Mastered",
    recommendedDays: 1,
  },
  {
    id: "curr-5",
    name: "FastAPI REST Protocols & Pydantic Validation",
    category: "Backend Services",
    coveragePercentage: 62,
    status: "Needs Review",
    recommendedDays: 5,
  },
];

function mapCandidate(c: any): Candidate {
  return {
    id: c.id,
    name: c.name,
    role: c.target_role || "Engineer",
    experience: c.experience_level || "mid",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
    skills: c.strengths || [],
    completedMissions: c.completed_days?.length || 0,
    overallScore: 80 + Math.min(20, c.completed_days?.length || 0),
    status: "Ready",
    bio: `A ${c.experience_level} professional focusing on ${c.target_role || "technology"}.`,
  };
}

export const apiService = {
  // GET /candidate
  async getCandidates(): Promise<Candidate[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/candidate`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return data.map(mapCandidate);
      }
    } catch (err) {
      console.warn("Failed to fetch candidates from API, using mock data", err);
    }
    return MOCK_CANDIDATES;
  },

  // GET /curriculum
  async getCurriculum(): Promise<CurriculumTopic[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return data.map((d: any) => ({
          id: `curr-${d.day}`,
          name: d.title,
          category: d.type || "General",
          coveragePercentage: 0,
          status: "Needs Review",
          recommendedDays: 1,
        }));
      }
    } catch {
      // Fallback
    }
    return MOCK_CURRICULUM;
  },

  // POST /interview/start
  async startInterview(payload: StartInterviewRequest): Promise<StartInterviewResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: payload.candidateId }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        
        // Fetch full candidate profile since backend only returns candidate_name
        let candidate = MOCK_CANDIDATES[0];
        try {
          const candRes = await fetch(`${API_BASE_URL}/candidate/${payload.candidateId}`);
          if (candRes.ok) {
            candidate = mapCandidate(await candRes.json());
          }
        } catch {}

        return {
          sessionId: data.session_id,
          candidate,
          initialQuestion: {
            id: `q-${data.question_number}`,
            topic: data.topic,
            difficulty: data.difficulty,
            content: data.question,
            timeLimitSeconds: 180,
            rubric: [],
          },
          initialMessage: {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.message || "Interview started. Good luck!",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        };
      }
    } catch {
      // Fallback mock start
    }

    const candidate = MOCK_CANDIDATES.find((c) => c.id === payload.candidateId) || MOCK_CANDIDATES[0];
    return {
      sessionId: `session-${Date.now()}`,
      candidate,
      initialQuestion: {
        id: "q-101",
        topic: "React 19 Server Components & Hydration",
        difficulty: "Hard",
        content:
          "Welcome to the technical evaluation. Could you explain the exact execution lifecycle of React Server Components (RSC) vs Client Components in Next.js 15, specifically detailing how stream hydration prevents waterfalls?",
        timeLimitSeconds: 180,
        rubric: ["Server boundary separation", "Suspense streaming", "Payload serialization"],
      },
      initialMessage: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content:
          "Hello! I am your AI Lead Architect Interviewer. I will be assessing your technical mastery across frontend engineering, backend streaming, and design architecture.\n\nLet's start with our first question on React 19 Server Components.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };
  },

  // POST /interview/answer
  async answerQuestion(payload: AnswerInterviewRequest): Promise<AnswerInterviewResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: payload.sessionId, answer: payload.userAnswer }),
        signal: AbortSignal.timeout(10000), // longer timeout for LLM
      });
      if (res.ok) {
        const data = await res.json();
        
        // Construct updated session (we might not have full session data without another API call, so we mock some parts)
        // Ideally we'd fetch GET /session/{sessionId} here. Let's do it if possible.
        let updatedSession: any = {
          sessionId: data.session_id,
          candidate: MOCK_CANDIDATES[0], // fallback
          currentQuestionIndex: data.question_number,
          totalQuestions: 5, // mock total
          durationSeconds: 300,
          timeRemainingSeconds: 180,
          status: data.is_finished ? "finished" : "in_progress",
          currentScore: (data.evaluation?.overall || 80),
          curriculumCoverage: 50,
          strongTopics: [],
          weakTopics: [],
        };

        try {
          const sessionRes = await fetch(`${API_BASE_URL}/session/${data.session_id}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            updatedSession.currentQuestionIndex = sessionData.question_count;
            updatedSession.strongTopics = sessionData.strong_topics;
            updatedSession.weakTopics = sessionData.weak_topics;
            if (sessionData.candidate_id) {
               const candRes = await fetch(`${API_BASE_URL}/candidate/${sessionData.candidate_id}`);
               if (candRes.ok) {
                 updatedSession.candidate = mapCandidate(await candRes.json());
               }
            }
          }
        } catch {}

        let nextMessageContent = data.feedback;
        if (data.message) {
            nextMessageContent += `\n\n${data.message}`;
        }
        if (data.next_question) {
            nextMessageContent += `\n\n**Next Question:** ${data.next_question}`;
        }

        return {
          nextMessage: {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: nextMessageContent,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          nextQuestion: data.next_question ? {
            id: `q-${data.question_number + 1}`,
            topic: data.topic,
            difficulty: data.difficulty,
            content: data.next_question,
            timeLimitSeconds: 180,
            rubric: [],
          } : undefined,
          updatedSession,
          isFinished: data.is_finished,
        };
      }
    } catch {
      // Fallback mock response generator
    }

    const questionsList = [
      {
        id: "q-102",
        topic: "State Hydration & Zustand Stores",
        difficulty: "Medium" as const,
        content:
          "Great breakdown! Now let's discuss state management. How do you handle Zustand store persistence across SSR in Next.js without causing hydration mismatch errors? Show a code snippet.",
        timeLimitSeconds: 180,
        rubric: ["Hydration hook", "Storage adapter", "SSR boundary"],
      },
      {
        id: "q-103",
        topic: "Async SSE & FastAPI Streaming",
        difficulty: "Expert" as const,
        content:
          "Excellent snippet. Moving to network architecture: Explain how you optimize Server-Sent Events (SSE) in FastAPI when streaming tokenized responses from an AI agent to a Next.js client with minimal buffering.",
        timeLimitSeconds: 240,
        rubric: ["StreamingResponse", "Event loop", "Backpressure"],
      },
    ];

    const randomQuestion = questionsList[Math.floor(Math.random() * questionsList.length)];

    return {
      nextMessage: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Your previous explanation was sharp and clearly demonstrated practical experience. \n\nHere is your next question regarding **${randomQuestion.topic}**:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        codeBlocks: [
          {
            language: "typescript",
            code: `// Example verification context\nimport { create } from 'zustand';\nimport { persist } from 'zustand/middleware';`,
          },
        ],
      },
      nextQuestion: randomQuestion,
      updatedSession: {
        sessionId: payload.sessionId,
        candidate: MOCK_CANDIDATES[0],
        currentQuestionIndex: 2,
        totalQuestions: 5,
        durationSeconds: 300,
        timeRemainingSeconds: 180,
        status: "in_progress",
        currentScore: 91,
        curriculumCoverage: 78,
        strongTopics: ["React 19 Server Components", "Hydration Mechanics"],
        weakTopics: ["FastAPI SSE Streaming"],
      },
      isFinished: false,
    };
  },

  // POST /interview/finish
  async finishInterview(payload: FinishInterviewRequest): Promise<InterviewReport> {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: payload.sessionId }),
        signal: AbortSignal.timeout(10000), // longer timeout for report generation
      });
      if (res.ok) {
        const data = await res.json();
        
        return {
          sessionId: data.session_id,
          candidateName: data.candidate_name,
          candidateRole: "Candidate", // Backend doesn't return role in report, could fetch from candidate API
          overallScore: Math.round(data.overall_score * 10), // Assuming backend score is 0-10, frontend uses 0-100
          completionTime: data.duration_seconds ? `${Math.round(data.duration_seconds / 60)} mins` : "Unknown",
          questionsAnswered: data.total_questions,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          recommendedCurriculumDays: data.recommended_curriculum_days?.length || 0,
          radarScores: [
             { subject: "Accuracy", score: (data.scores.accuracy || 0) * 10, fullMark: 100 },
             { subject: "Depth", score: (data.scores.depth || 0) * 10, fullMark: 100 },
             { subject: "Communication", score: (data.scores.communication || 0) * 10, fullMark: 100 },
             { subject: "Confidence", score: (data.scores.confidence || 0) * 10, fullMark: 100 },
             { subject: "System Design", score: (data.scores.system_design || 0) * 10, fullMark: 100 },
             { subject: "Practical Knowledge", score: (data.scores.practical_knowledge || 0) * 10, fullMark: 100 },
          ],
          topicBreakdown: data.conversation_log.map((turn: any) => ({
             topic: turn.topic || "General",
             score: turn.evaluation ? (turn.evaluation.accuracy * 10) : 0,
             feedback: turn.feedback || "",
          })),
          timelineEvents: data.conversation_log.map((turn: any) => ({
             time: new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             title: `Question ${turn.question_number}`,
             description: turn.topic,
             type: "neutral"
          }))
        };
      }
    } catch (err) {
      console.warn("Failed to finish interview on backend", err);
      // Fallback
    }

    return {
      sessionId: payload.sessionId,
      candidateName: "Alex Rivera",
      candidateRole: "Senior Full Stack Engineer",
      overallScore: 94,
      completionTime: "14 mins 32 secs",
      questionsAnswered: 5,
      strengths: [
        "Flawless understanding of React 19 RSC & Hydration boundaries",
        "Clear code syntax structuring with Zustand TypeScript stores",
        "Strong awareness of UX micro-animations & layout performance",
      ],
      weaknesses: [
        "Could deepen backpressure handling in FastAPI SSE streaming response loops",
        "Edge-case error boundary handling for failed WebSocket reconnections",
      ],
      recommendedCurriculumDays: 2,
      radarScores: [
        { subject: "React 19 & Next.js", score: 98, fullMark: 100 },
        { subject: "TypeScript & State", score: 95, fullMark: 100 },
        { subject: "FastAPI & Python", score: 84, fullMark: 100 },
        { subject: "UI / Motion Design", score: 96, fullMark: 100 },
        { subject: "System Architecture", score: 91, fullMark: 100 },
        { subject: "Problem Solving", score: 92, fullMark: 100 },
      ],
      topicBreakdown: [
        { topic: "React 19 Server Components", score: 98, feedback: "Exceptional mastery of stream hydration & boundary isolation." },
        { topic: "Zustand State Store", score: 94, feedback: "Clean store patterns with proper hydration safeguards." },
        { topic: "FastAPI Streaming", score: 82, feedback: "Understands AsyncGenerator but needs deeper backpressure control." },
        { topic: "Tailwind & Framer Motion", score: 96, feedback: "Top tier aesthetic design sense and smooth animation control." },
      ],
      timelineEvents: [
        { time: "00:00", title: "Session Started", description: "Candidate initiated the assessment session.", type: "neutral" },
        { time: "03:15", title: "Q1 Answered", description: "Demonstrated deep RSC execution knowledge.", type: "positive" },
        { time: "07:40", title: "Q2 Code Snippet", description: "Provided clean TypeScript Zustand store implementation.", type: "positive" },
        { time: "11:20", title: "Q3 System Design", description: "Identified FastAPI stream optimization targets.", type: "warning" },
        { time: "14:32", title: "Assessment Finished", description: "Overall score calculated at 94/100 (Pass - Top 2%).", type: "positive" },
      ],
    };
  },
};
