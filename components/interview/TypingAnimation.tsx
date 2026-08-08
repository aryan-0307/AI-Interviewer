"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, Sparkles, Cpu } from "lucide-react";

interface TypingAnimationProps {
  phaseText?: string | null;
}

export function TypingAnimation({ phaseText }: TypingAnimationProps) {
  const displayPhase = phaseText || "Analyzing your previous answer...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#18181B]/90 border border-indigo-500/30 backdrop-blur-xl shadow-glow-primary max-w-lg"
    >
      {/* Bot Icon with glowing pulse ring */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
        <Bot className="w-5 h-5 text-white" />
        <span className="absolute -inset-1 rounded-full border border-indigo-400/40 animate-ping" />
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-300 font-mono flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> AI Reasoning Cycle
          </span>
          <Loader2 className="w-3 h-3 text-indigo-400 animate-spin ml-auto" />
        </div>

        {/* Phase Text Animation Transition */}
        <AnimatePresence mode="wait">
          <motion.p
            key={displayPhase}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-zinc-300 font-medium tracking-wide flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{displayPhase}</span>
          </motion.p>
        </AnimatePresence>

        {/* Animated Dots */}
        <div className="flex gap-1.5 pt-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-purple-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
