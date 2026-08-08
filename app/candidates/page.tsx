"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";
import { Candidate } from "@/types/interview";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Search,
  Filter,
  Play,
  Award,
  CheckCircle2,
  Sparkles,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";

export default function CandidatesPage() {
  const router = useRouter();
  const { candidates, fetchCandidates, setSelectedCandidate, startInterview } =
    useInterviewStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filterOptions = ["All", "Full Stack", "AI / ML", "Systems", "Design"];

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeFilter === "All") return matchesSearch;
    return matchesSearch && cand.role.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleStartMission = async (cand: Candidate) => {
    setSelectedCandidate(cand);
    await startInterview(cand.id);
    router.push("/interview");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-[#18181B]/80 border border-white/10 backdrop-blur-2xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Assessment Roster
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Candidate Selection</h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Select a candidate profile to initiate an autonomous technical evaluation session.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, role, or skills..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-[#18181B] text-zinc-400 border border-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCandidates.map((cand) => (
          <GlassCard key={cand.id} hoverEffect className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={cand.avatar} name={cand.name} size="lg" statusIndicator />
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {cand.name}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cand.status}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      {cand.role} • <span className="text-zinc-300">{cand.experience}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-400 font-mono block">Prior Benchmark</span>
                  <span className="text-xl font-extrabold font-mono text-indigo-400">
                    {cand.overallScore} / 100
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-zinc-300 leading-relaxed">{cand.bio}</p>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Core Skills & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-zinc-300 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Completed Missions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Missions Completed:
                  </span>
                  <span className="font-mono text-zinc-200 font-bold">
                    {cand.completedMissions} Assessments
                  </span>
                </div>
                <ProgressBar value={Math.min(100, cand.completedMissions * 5)} color="indigo" size="sm" />
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={() => handleStartMission(cand)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Assessment Mission with {cand.name.split(" ")[0]}</span>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
