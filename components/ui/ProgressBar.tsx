"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: "indigo" | "emerald" | "amber" | "rose" | "white";
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  color = "indigo",
  showLabel = false,
  className,
  size = "md",
}: ProgressBarProps) {
  const colorGradients = {
    indigo: "from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]",
    emerald: "from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]",
    amber: "from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
    rose: "from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
    white: "from-white to-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.5)]",
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5 font-medium">
          <span>Progress</span>
          <span className="text-zinc-200 font-mono">{clampedValue}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/5",
          heightClasses[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-300",
            colorGradients[color]
          )}
        />
      </div>
    </div>
  );
}
