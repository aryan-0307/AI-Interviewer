"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Cpu } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Initializing AI Interview Session..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B]/90 backdrop-blur-2xl">
      <div className="relative flex flex-col items-center max-w-sm text-center p-8 rounded-3xl bg-[#18181B]/80 border border-white/10 shadow-2xl">
        {/* Animated Glow Halo */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-600/30 blur-xl animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border-2 border-dashed border-indigo-500/50 flex items-center justify-center"
          />
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> AI Agent Processing
        </h3>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-6">{message}</p>

        {/* Loading Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
