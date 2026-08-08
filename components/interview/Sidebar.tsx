"use client";

import React from "react";
import { InterviewSession } from "@/types/interview";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import {
  Trophy,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Flag,
} from "lucide-react";

interface SidebarProps {
  session: InterviewSession | null;
  onFinishInterview?: () => void;
}

export function Sidebar({ session, onFinishInterview }: SidebarProps) {
  if (!session) {
    return (
      <aside className="w-full lg:w-80 shrink-0 p-5 rounded-2xl bg-[#18181B]/80 border border-white/10 text-zinc-400 text-sm">
        No active interview session.
      </aside>
    );
  }

  const { candidate, currentQuestionIndex, totalQuestions, currentScore, curriculumCoverage, strongTopics, weakTopics } = session;
  const progressPercent = Math.round((currentQuestionIndex / totalQuestions) * 100);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-5">
      {/* Candidate Profile Card */}
      <div className="p-5 rounded-2xl bg-[#18181B]/90 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-3">
          <Avatar src={candidate.avatar} name={candidate.name} size="lg" statusIndicator />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-zinc-100 truncate">{candidate.name}</h4>
            <p className="text-xs text-zinc-400 truncate">{candidate.role}</p>
            <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {candidate.experience} Exp
            </span>
          </div>
        </div>

        {/* Finish Interview Action */}
        {onFinishInterview && (
          <button
            onClick={onFinishInterview}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Finish & Generate Report</span>
          </button>
        )}
      </div>

      {/* Live Metrics Grid */}
      <div className="p-5 rounded-2xl bg-[#18181B]/90 border border-white/10 backdrop-blur-xl space-y-5">
        <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Session Telemetry
        </h5>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Interview Completion</span>
            <span className="font-mono text-zinc-200 font-bold">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} color="indigo" size="sm" />
          <span className="text-[10px] text-zinc-400 font-mono">
            Question {currentQuestionIndex} of {totalQuestions}
          </span>
        </div>

        {/* Score & Coverage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-medium">Score</span>
            </div>
            <p className="text-xl font-bold font-mono text-white">{currentScore}</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-medium">Coverage</span>
            </div>
            <p className="text-xl font-bold font-mono text-white">{curriculumCoverage}%</p>
          </div>
        </div>

        {/* Strong Topics */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strong Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {strongTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Growth Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {weakTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
