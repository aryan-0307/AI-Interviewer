export type Role = "user" | "assistant" | "system";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  avatar: string;
  skills: string[];
  completedMissions: number;
  overallScore: number;
  status: "Ready" | "In Progress" | "Completed";
  bio: string;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  content: string;
  timeLimitSeconds: number;
  rubric: string[];
}

export interface ChatMessageItem {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  codeBlocks?: { language: string; code: string }[];
  thinkingStatus?: string; // e.g., "Analyzing your previous answer..."
}

export interface CurriculumTopic {
  id: string;
  name: string;
  category: string;
  coveragePercentage: number;
  status: "Mastered" | "In Progress" | "Needs Review";
  recommendedDays?: number;
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion?: Question;
  durationSeconds: number;
  timeRemainingSeconds: number;
  status: "idle" | "thinking" | "in_progress" | "paused" | "finished";
  currentScore: number;
  curriculumCoverage: number;
  strongTopics: string[];
  weakTopics: string[];
}

export interface ReportTopicScore {
  subject: string;
  score: number;
  fullMark: number;
}

export interface InterviewReport {
  sessionId: string;
  candidateName: string;
  candidateRole: string;
  overallScore: number;
  completionTime: string;
  questionsAnswered: number;
  strengths: string[];
  weaknesses: string[];
  recommendedCurriculumDays: number;
  radarScores: ReportTopicScore[];
  topicBreakdown: {
    topic: string;
    score: number;
    feedback: string;
  }[];
  timelineEvents: {
    time: string;
    title: string;
    description: string;
    type: "positive" | "neutral" | "warning";
  }[];
}

// FastAPI API Request & Response Schemas
export interface StartInterviewRequest {
  candidateId: string;
  targetRole: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  candidate: Candidate;
  initialQuestion: Question;
  initialMessage: ChatMessageItem;
  totalQuestions: number;
}

export interface AnswerInterviewRequest {
  sessionId: string;
  userAnswer: string;
  timeTakenSeconds: number;
}

export interface AnswerInterviewResponse {
  nextMessage: ChatMessageItem;
  nextQuestion?: Question;
  updatedSession: InterviewSession;
  isFinished: boolean;
  totalQuestions: number;
}

export interface FinishInterviewRequest {
  sessionId: string;
}
