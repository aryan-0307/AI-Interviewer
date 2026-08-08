"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Bot,
  Sparkles,
  Zap,
  Play,
  CheckCircle2,
  ShieldCheck,
  Brain,
  Code2,
  ChevronDown,
  ArrowRight,
  Target,
  BarChart2,
  Clock,
  Terminal,
} from "lucide-react";

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const features = [
    {
      icon: Brain,
      title: "Adaptive AI Reasoning",
      description:
        "Dynamically recalibrates question difficulty based on real-time candidate code structure and response nuance.",
    },
    {
      icon: Code2,
      title: "Live Code Benchmarking",
      description:
        "Evaluates TypeScript, Python, and system architecture responses with instant AST syntax parsing and rubric scoring.",
    },
    {
      icon: BarChart2,
      title: "Radar Skill Diagnostics",
      description:
        "Generates multi-dimensional radar scorecards highlighting core strengths, edge-case vulnerabilities, and study plans.",
    },
    {
      icon: ShieldCheck,
      title: "Unbiased & Standardized",
      description:
        "Eliminates interviewer bias with structured evaluation rubrics and repeatable test benchmarks across candidates.",
    },
  ];

  const timelineSteps = [
    {
      step: "01",
      title: "Candidate Profile & Mission Setup",
      desc: "Select candidate background, tech stack requirements, and target difficulty tier.",
      icon: Target,
    },
    {
      step: "02",
      title: "Autonomous Live Interview Session",
      desc: "Interactive ChatGPT-style dialog with live countdown timer, markdown rendering, and code prompts.",
      icon: Bot,
    },
    {
      step: "03",
      title: "Multi-Stage AI Reasoning Cycle",
      desc: "Agent analyzes answers, checks curriculum coverage, and formulates follow-up probes in real time.",
      icon: Zap,
    },
    {
      step: "04",
      title: "Analytical Report & Actionable Insights",
      desc: "Circular scores, radar charts, timestamped timeline events, and exportable PDF summaries.",
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      q: "How does the AI Interviewer adapt during the session?",
      a: "The agent evaluates your answers in real-time. If you demonstrate mastery of a topic, it smoothly escalates to more complex, architectural edge cases.",
    },
    {
      q: "How are the final scores calculated?",
      a: "Scores are derived from a multi-dimensional rubric that evaluates accuracy, depth of knowledge, system design thinking, and practical application. The AI cross-references your answers against industry standards.",
    },
    {
      q: "Is the AI Interviewer biased?",
      a: "Our AI model is designed to be highly objective and standardized. It evaluates candidates strictly based on technical accuracy and reasoning, mitigating the unconscious bias often present in human interviews.",
    },
    {
      q: "What if I get disconnected during my interview?",
      a: "Don't worry. Your session progress, including your chat history and time remaining, is automatically saved. You can resume right where you left off when you reconnect.",
    },
  ];

  return (
    <div className="relative min-h-screen space-y-24 pb-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]"
        >
          Hire Better with{" "}
          <span className="block mt-2 text-gradient">AI Interviewer</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Experience a ChatGPT-inspired live interview platform with Linear-grade UI, real-time code evaluation, radar skill breakdown, and instant report synthesis.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/candidates"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Free Interview</span>
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#18181B] border border-white/15 text-zinc-200 hover:bg-zinc-800 hover:text-white font-semibold text-sm transition-all duration-300 backdrop-blur-xl"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Launch Live Sandbox</span>
          </Link>
        </motion.div>

        {/* Hero Visual Mock Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-2xl"
        >
          <div className="rounded-2xl bg-[#09090B] border border-white/10 overflow-hidden shadow-2xl">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#18181B] border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-indigo-400" /> ai-interview-session // active
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live SSE Connected
              </span>
            </div>

            {/* Content Preview */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-[#18181B]/90 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-indigo-400">AI Architect Pro</p>
                    <p className="text-sm text-zinc-200">
                      Explain how Next.js 15 Server Actions maintain CSRF protection while handling optimistic state updates in React 19.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                    AR
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-300">Alex Rivera (Candidate)</p>
                    <p className="text-sm text-zinc-300 font-mono">
                      Server Actions utilize HTTP POST headers verified against origin checks, paired with React useOptimistic for immediate UI transition rollback...
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Preview */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-white/10 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Current Score</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">94 / 100</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Curriculum Coverage</span>
                    <span className="font-mono text-zinc-200">88%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[88%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Engineered for Technical Precision</h2>
          <p className="text-sm text-zinc-400 mt-2">
            Combining the intuitive speed of ChatGPT with the clinical analytics of Linear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <GlassCard key={idx} hoverEffect className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* INTERVIEW PROCESS TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-[#18181B]/80 border border-white/10 backdrop-blur-2xl space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Execution Architecture
            </span>
            <h2 className="text-3xl font-bold text-white mt-1">Interview Process Timeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-indigo-500/60">
                      {step.step}
                    </span>
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h4 className="text-base font-bold text-zinc-100">{step.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400 mt-2">Everything you need to know about the AI Interviewer.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#18181B]/90 border border-white/10 overflow-hidden backdrop-blur-xl"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-zinc-100 hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                    openFaqIndex === idx ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-6 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
