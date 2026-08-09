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
              <span className="font-bold text-white tracking-tight">AI Interviewer</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Autonomous AI assessment platform engineered for modern engineering teams.
            </p>
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

          {/* Legal */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3">
              Legal
            </h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Conditions
                </Link>
              </li>
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
