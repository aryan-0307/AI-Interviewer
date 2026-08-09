"use client";

import React, { useEffect, useState } from "react";
import { Question } from "@/types/interview";
import { Clock, HelpCircle, Target, CheckCircle2 } from "lucide-react";
import { formatTime, getDifficultyBadgeColor } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: Question | null;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [timeLeft, setTimeLeft] = useState(question?.timeLimitSeconds || 180);

  useEffect(() => {
    if (!question) return;
    setTimeLeft(question.timeLimitSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [question]);

  if (!question) {
    return (
      <div className="p-6 rounded-2xl bg-[#18181B]/80 border border-white/10 text-center text-zinc-400">
        Preparing question stream...
      </div>
    );
  }

  const isLowTime = timeLeft < 30;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="p-4 md:p-6 rounded-2xl bg-[#18181B]/90 border border-white/10 backdrop-blur-xl shadow-glass relative shrink-0"
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 md:pb-4 md:mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold font-mono ${getDifficultyBadgeColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Live Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
            isLowTime
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
              : "bg-zinc-800 text-zinc-200 border-white/10"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Topic Title */}
      <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
        <Target className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-semibold">{question.topic}</span>
      </div>

      {/* Question Content */}
      <h3 className="text-sm md:text-lg font-semibold text-zinc-100 leading-snug mb-2 md:mb-4">
        {question.content}
      </h3>

      {/* Evaluation Rubrics */}
      {question.rubric && (
        <div className="pt-3 border-t border-white/5 hidden md:block">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
            Target Evaluation Metrics
          </span>
          <div className="flex flex-wrap gap-2">
            {question.rubric.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
