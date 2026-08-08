"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number; // 0 - 100
  title: string;
  subtitle?: string;
  color?: "indigo" | "emerald" | "amber" | "rose";
  className?: string;
}

export function ScoreCard({
  score,
  title,
  subtitle,
  color = "indigo",
  className,
}: ScoreCardProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorStyles = {
    indigo: "stroke-indigo-500 text-indigo-400 shadow-indigo-500/20",
    emerald: "stroke-emerald-500 text-emerald-400 shadow-emerald-500/20",
    amber: "stroke-amber-500 text-amber-400 shadow-amber-500/20",
    rose: "stroke-rose-500 text-rose-400 shadow-rose-500/20",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-2xl bg-[#18181B]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden text-center",
        className
      )}
    >
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            className={cn("transition-all duration-1000 ease-out", colorStyles[color])}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      <h4 className="text-base font-semibold text-zinc-100">{title}</h4>
      {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
