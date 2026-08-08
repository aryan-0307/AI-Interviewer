"use client";

import React from "react";
import Link from "next/link";
import { Bot, Github, Twitter, Terminal, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#09090B] relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">AI Interviewer</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Autonomous AI assessment platform engineered for modern engineering teams. Powered by Next.js 15, FastAPI, and real-time streaming analytics.
            </p>
            <div className="flex items-center gap-2 text-zinc-400 pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Enterprise Edition
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5">
                <Terminal className="w-3 h-3 text-emerald-400" /> FastAPI Engine
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Overview & Features
                </Link>
              </li>
              <li>
                <Link href="/candidates" className="hover:text-white transition-colors">
                  Candidate Roster
                </Link>
              </li>
              <li>
                <Link href="/interview" className="hover:text-white transition-colors">
                  Interview Environment
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-white transition-colors">
                  Analytical Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Stack Architecture
            </h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>Next.js 15 App Router</li>
              <li>Tailwind CSS & Glassmorphism</li>
              <li>Framer Motion Animations</li>
              <li>FastAPI & SSE Streaming</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AI Interviewer.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-zinc-300 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
