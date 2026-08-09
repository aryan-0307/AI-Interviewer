import { create } from "zustand";
import {
  Candidate,
  ChatMessageItem,
  InterviewSession,
  InterviewReport,
  Question,
} from "@/types/interview";
import { apiService, MOCK_CANDIDATES } from "@/services/api";

interface InterviewState {
  // Candidate Selection State
  selectedCandidate: Candidate | null;
  candidates: Candidate[];
  isCandidatesLoading: boolean;

  // Session State
  session: InterviewSession | null;
  messages: ChatMessageItem[];
  currentQuestion: Question | null;

  // UX & Thinking Animations State
  thinkingPhase: string | null; // e.g. "Analyzing your previous answer..."
  isThinking: boolean;
  isStreaming: boolean;
  isGlobalLoading: boolean;

  // Report State
  report: InterviewReport | null;

  // Actions
  setSelectedCandidate: (candidate: Candidate) => void;
  fetchCandidates: () => Promise<void>;
  startInterview: (candidateId?: string) => Promise<void>;
  submitAnswer: (answerText: string) => Promise<void>;
  finishInterview: () => Promise<InterviewReport | null>;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  selectedCandidate: MOCK_CANDIDATES[0],
  candidates: MOCK_CANDIDATES,
  isCandidatesLoading: false,

  session: null,
  messages: [],
  currentQuestion: null,

  thinkingPhase: null,
  isThinking: false,
  isStreaming: false,
  isGlobalLoading: false,

  report: null,

  setSelectedCandidate: (candidate: Candidate) => {
    set({ selectedCandidate: candidate });
  },

  fetchCandidates: async () => {
    set({ isCandidatesLoading: true });
    const list = await apiService.getCandidates();
    set({ candidates: list, isCandidatesLoading: false });
  },

  startInterview: async (candidateId?: string) => {
    const candidateToUse =
      get().candidates.find((c) => c.id === candidateId) ||
      get().selectedCandidate ||
      get().candidates[0];

    set({ isGlobalLoading: true, selectedCandidate: candidateToUse });

    const response = await apiService.startInterview({
      candidateId: candidateToUse.id,
      targetRole: candidateToUse.role,
    });

    const initialSession: InterviewSession = {
      sessionId: response.sessionId,
      candidate: candidateToUse,
      currentQuestionIndex: 1,
      totalQuestions: response.totalQuestions,
      currentQuestion: response.initialQuestion,
      durationSeconds: 0,
      timeRemainingSeconds: response.initialQuestion.timeLimitSeconds,
      status: "in_progress",
      currentScore: 0,
      curriculumCoverage: 0,
      strongTopics: [],
      weakTopics: [],
    };

    set({
      session: initialSession,
      currentQuestion: response.initialQuestion,
      messages: [response.initialMessage],
      isGlobalLoading: false,
      report: null,
    });
  },

  submitAnswer: async (answerText: string) => {
    const { session, messages } = get();
    if (!session) return;

    // Add user message immediately
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set({ messages: [...messages, userMsg], isThinking: true });

    // Multi-stage UX thinking sequence as required:
    // 1. "Analyzing your previous answer..."
    set({ thinkingPhase: "Analyzing your previous answer..." });
    await new Promise((r) => setTimeout(r, 900));

    // 2. "Searching relevant curriculum..."
    set({ thinkingPhase: "Searching relevant curriculum..." });
    await new Promise((r) => setTimeout(r, 900));

    // 3. "Generating next interview question..."
    set({ thinkingPhase: "Generating next interview question..." });
    await new Promise((r) => setTimeout(r, 800));

    // Call API
    const response = await apiService.answerQuestion({
      sessionId: session.sessionId,
      userAnswer: answerText,
      timeTakenSeconds: 45,
    });

    set({
      isThinking: false,
      thinkingPhase: null,
      isStreaming: true,
      messages: [...get().messages, response.nextMessage],
      session: response.updatedSession,
      currentQuestion: response.nextQuestion || get().currentQuestion,
    });

    // End streaming effect after brief animation frame
    setTimeout(() => {
      set({ isStreaming: false });
    }, 600);
  },

  finishInterview: async () => {
    const { session } = get();
    set({ isGlobalLoading: true });
    const reportData = await apiService.finishInterview({
      sessionId: session?.sessionId || "session-demo",
    });
    set({
      report: reportData,
      isGlobalLoading: false,
      session: session ? { ...session, status: "finished" } : null,
    });
    return reportData;
  },

  resetSession: () => {
    set({
      session: null,
      messages: [],
      currentQuestion: null,
      thinkingPhase: null,
      isThinking: false,
      isStreaming: false,
      report: null,
    });
  },
}));
