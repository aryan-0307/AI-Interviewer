"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bot, Users, Play, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview",        href: "/",           icon: Sparkles  },
  { label: "Candidates",      href: "/candidates", icon: Users     },
  { label: "Interview Lab",   href: "/interview",  icon: Play      },
  { label: "Analytics Report",href: "/report",     icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090B]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Brand Logo ── */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#09090B] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              AI Interviewer{" "}
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase font-mono font-bold">
                Pro v2
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide font-mono">
              ChatGPT + Linear Assessment Engine
            </span>
          </div>
        </Link>

        {/* ── Navigation pill bar ── */}
        <nav
          className="hidden md:flex items-center gap-1.5 bg-[#18181B]/60 p-1.5 rounded-full border border-white/10"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive  = pathname === item.href;
            const isHovered = hoveredHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref(null)}
                aria-current={isActive ? "page" : undefined}
                className="relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {/* ── Sliding active pill (shared layoutId) ── */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-indigo-600 shadow-md shadow-indigo-600/40"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                {/* ── Hover highlight (only when not active) ── */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.span
                      key="hover-bg"
                      className="absolute inset-0 rounded-full bg-white/[0.07] border border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                {/* ── Hover dot indicator (bottom center, distinct from filled pill) ── */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.span
                      key="hover-dot"
                      className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400/70"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>

                {/* ── Icon — shifts to full indigo on hover or active ── */}
                <motion.span
                  animate={{
                    color: isActive
                      ? "#ffffff"
                      : isHovered
                        ? "#818cf8"   // indigo-400
                        : "#6366f1",  // indigo-500 (subtle base)
                  }}
                  transition={{ duration: 0.18 }}
                  className="relative z-10 flex shrink-0"
                  aria-hidden="true"
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.span>

                {/* ── Label ── */}
                <motion.span
                  animate={{
                    color: isActive
                      ? "#ffffff"
                      : isHovered
                        ? "#e4e4e7"   // zinc-200
                        : "#a1a1aa",  // zinc-400
                  }}
                  transition={{ duration: 0.18 }}
                  className="relative z-10"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* ── CTA Button ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/candidates"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Interview</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
