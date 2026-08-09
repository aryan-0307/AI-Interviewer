"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Bot, Users, Play, BarChart3, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/store/useInterviewStore";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: Sparkles },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Interview Lab", href: "/interview", icon: Play },
  { label: "Analytics Report", href: "/report", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { finishInterview, isGlobalLoading } = useInterviewStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300",
      isScrolled ? "pt-6 px-4" : "pt-0 px-0"
    )}>
      <header className={cn(
        "w-full transition-all duration-300 border bg-[#09090B]/60 backdrop-blur-2xl pointer-events-auto overflow-hidden",
        isScrolled
          ? "max-w-5xl rounded-2xl border-white/10 shadow-2xl shadow-black/50"
          : "max-w-none rounded-none border-b-white/5 border-t-transparent border-l-transparent border-r-transparent shadow-none"
      )}>
        <div className={cn(
          "h-16 flex items-center justify-between transition-all duration-300",
          !isScrolled && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
          isScrolled && "px-4 sm:px-6"
        )}>

          {/* ── Brand Logo ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                AI Interviewer{" "}
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
              const isActive = pathname === item.href;
              const isHovered = hoveredHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {/* ── Sliding active pill (shared layoutId) ── */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-md shadow-white/20"
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
                        className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      />
                    )}
                  </AnimatePresence>

                  {/* ── Icon — shifts to full white on hover or active ── */}
                  <motion.span
                    animate={{
                      color: isActive
                        ? "#000000"
                        : isHovered
                          ? "#ffffff"
                          : "#a1a1aa",
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
                        ? "#000000"
                        : isHovered
                          ? "#ffffff"
                          : "#a1a1aa",
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
            {pathname === "/interview" ? (
              <button
                onClick={async () => {
                  await finishInterview();
                  router.push("/report");
                }}
                disabled={isGlobalLoading}
                className="relative group flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="inline">Finish</span>
              </button>
            ) : (
              <Link
                href="/candidates"
                className="relative group flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500 -z-10" />
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Launch Interview</span>
              </Link>
            )}
          </div>

        </div>
      </header>
    </div>
  );
}
