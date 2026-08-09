"use client";

import React from "react";
import { CurriculumTopic } from "@/types/interview";
import { BookOpen, Calendar, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface CurriculumCardProps {
  topic: CurriculumTopic;
}

export function CurriculumCard({ topic }: CurriculumCardProps) {
  const isMastered = topic.status === "Mastered";

  return (
    <div className="p-4 rounded-xl bg-[#18181B]/80 border border-white/10 backdrop-blur-md hover:border-indigo-500/30 transition-all space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
            {topic.category}
          </span>
          <h5 className="text-sm font-semibold text-zinc-100">{topic.name}</h5>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            isMastered
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}
        >
          {topic.status}
        </span>
      </div>

      <ProgressBar
        value={topic.coveragePercentage}
        color={isMastered ? "emerald" : "amber"}
        size="sm"
        showLabel
      />

      {topic.recommendedDays && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recommended Study Plan: {topic.recommendedDays} Days</span>
          </div>
          
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(topic.name + " tutorial best practices")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Study <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
