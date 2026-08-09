"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import { ChatMessage } from "@/components/interview/ChatMessage";
import { ChatInput } from "@/components/interview/ChatInput";
import { TypingAnimation } from "@/components/interview/TypingAnimation";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { Sidebar } from "@/components/interview/Sidebar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Bot, AlertCircle } from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    session,
    messages,
    currentQuestion,
    isThinking,
    thinkingPhase,
    isGlobalLoading,
    selectedCandidate,
    startInterview,
    submitAnswer,
    finishInterview,
  } = useInterviewStore();

  // Auto initialize session if none present
  useEffect(() => {
    if (!session) {
      startInterview();
    }
  }, [session, startInterview]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleFinish = async () => {
    await finishInterview();
    router.push("/report");
  };

  if (isGlobalLoading) {
    return <LoadingScreen message="Spinning up isolated AI evaluation sandbox..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
      {/* Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chat & Question Area (8 Cols) */}
        <main className="lg:col-span-8 flex flex-col h-[calc(100dvh-100px)] lg:h-[calc(100vh-140px)] min-h-0 lg:min-h-[600px] space-y-4">
          {/* Active Question Banner */}
          <div className="shrink-0 max-h-[35vh] lg:max-h-none overflow-y-auto rounded-2xl">
            <QuestionCard
              question={currentQuestion}
              questionNumber={session?.currentQuestionIndex || 1}
              totalQuestions={session?.totalQuestions || 5}
            />
          </div>

          {/* Chat Stream History Container */}
          <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#09090B]/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-inner">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                userAvatar={selectedCandidate?.avatar}
                userName={selectedCandidate?.name}
              />
            ))}

            {/* AI Thinking Animation Indicator */}
            {isThinking && (
              <div className="py-2">
                <TypingAnimation phaseText={thinkingPhase} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="shrink-0 pt-2">
            <ChatInput
              onSendMessage={submitAnswer}
              disabled={isThinking}
              placeholder={
                isThinking
                  ? "AI Interviewer is analyzing response..."
                  : "Type your technical response, explanation, or code... (Press Enter to submit)"
              }
            />
          </div>
        </main>

        {/* Sidebar Diagnostics Panel (4 Cols) */}
        <div className="lg:col-span-4 hidden lg:block">
          <Sidebar session={session} onFinishInterview={handleFinish} />
        </div>
      </div>
    </div>
  );
}
