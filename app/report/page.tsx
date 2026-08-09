"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { RadarChart } from "@/components/report/RadarChart";
import { TopicBarChart } from "@/components/report/TopicBarChart";
import { CurriculumCard } from "@/components/report/CurriculumCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MOCK_CURRICULUM } from "@/services/api";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  BookOpen,
  ExternalLink,
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const { report, session, resetSession, startInterview } = useInterviewStore();

  const activeReport = report || {
    sessionId: "demo-session",
    candidateName: session?.candidate?.name || "Alex Rivera",
    candidateRole: session?.candidate?.role || "Senior Full Stack Engineer",
    overallScore: session?.currentScore || 94,
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

  useEffect(() => {
    // Trigger celebratory confetti conditionally
    if (activeReport.overallScore >= 80) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#22c55e", "#fbbf24"],
      });
    } else if (activeReport.overallScore >= 60) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7"],
      });
    }
  }, [activeReport.overallScore]);

  const handleRestart = async () => {
    resetSession();
    await startInterview();
    router.push("/interview");
  };

  const handleDownloadPDF = () => {
    window.print();
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 print:py-0 print:px-0">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-[#18181B]/80 border border-white/10 backdrop-blur-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Assessment Certified
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ID: {activeReport.sessionId}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Interview Analytics Report: {activeReport.candidateName}
          </h1>
          <p className="text-sm text-zinc-400">
            Target Role: <span className="text-zinc-200 font-medium">{activeReport.candidateRole}</span> • Completed in {activeReport.completionTime}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/15 text-zinc-200 hover:bg-zinc-800 hover:text-white font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Report (PDF)</span>
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Interview</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Ring Card */}
        <GlassCard className="flex flex-col items-center justify-center text-center">
          <ScoreCard
            score={activeReport.overallScore}
            title="Overall Evaluation Score"
            subtitle="Top 2% Candidate Benchmark"
            color="indigo"
          />
        </GlassCard>

        {/* Radar Chart Card */}
        <GlassCard className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Skill Competency Radar
            </h3>
            <span className="text-xs font-mono text-zinc-400">6 Vector Dimensions</span>
          </div>
          <RadarChart data={activeReport.radarScores} />
        </GlassCard>
      </div>

      {/* NEW: Topic Breakdown Bar Chart */}
      <GlassCard className="space-y-2 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" /> Topic Performance Breakdown
          </h3>
          <span className="text-xs font-mono text-zinc-400">Score per Question Topic</span>
        </div>
        <TopicBarChart data={activeReport.topicBreakdown} />
      </GlassCard>

      {/* Strengths vs Growth Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Validated Strengths
          </h3>
          <ul className="space-y-3">
            {activeReport.strengths.map((st, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-zinc-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Weaknesses / Growth Areas */}
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Target Growth Areas
          </h3>
          <ul className="space-y-3">
            {activeReport.weaknesses.map((wk, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-zinc-200"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Actionable Feedback & Study Plan */}
      <GlassCard className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Actionable Study Resources
          </h3>
          <span className="text-xs font-mono text-indigo-300">Generated from weaknesses</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeReport.weaknesses.map((wk, i) => (
            <a
              key={i}
              href={`https://www.google.com/search?q=${encodeURIComponent(wk + " tutorial architecture")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-[#18181B]/50 border border-white/5 hover:border-indigo-500/30 transition-all group"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {wk}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                  Research resources <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </GlassCard>

      {/* Recommended Curriculum */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Recommended Study Curriculum (
            {activeReport.recommendedCurriculumDays} Days)
          </h3>
          <span className="text-xs font-mono text-indigo-300">Custom Adaptive Roadmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeReport.topicBreakdown.slice(0, 6).map((topicData, idx) => {
            const score = topicData.score;
            let status: "Mastered" | "In Progress" | "Needs Review" = "Needs Review";
            let recDays = 4;
            
            if (score >= 90) {
              status = "Mastered";
              recDays = 1; // Or 0, but let's give 1 for review
            } else if (score >= 60) {
              status = "In Progress";
              recDays = 2;
            }

            return (
              <CurriculumCard 
                key={idx} 
                topic={{
                  id: `topic-${idx}`,
                  name: topicData.topic,
                  category: "Interview Topic",
                  status: status,
                  coveragePercentage: score,
                  recommendedDays: recDays
                }} 
              />
            );
          })}
        </div>
      </div>

      {/* Assessment Timeline Events */}
      <GlassCard className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" /> Session Execution Timeline
        </h3>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {activeReport.timelineEvents.map((evt, idx) => (
            <div key={idx} className="relative pl-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#09090B]" />
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">{evt.time}</span>
                <h4 className="text-sm font-semibold text-zinc-100">{evt.title}</h4>
                <p className="text-xs text-zinc-400">{evt.description}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 w-fit">
                Event Logged
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
