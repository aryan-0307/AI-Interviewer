"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, Home, AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="max-w-md w-full text-center space-y-6 p-8">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold font-mono text-white tracking-wider">
            404
          </span>
          <h2 className="text-xl font-bold text-zinc-100">Page Not Found</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The requested interview route or candidate evaluation mission does not exist or has been archived.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Command Center</span>
        </Link>
      </GlassCard>
    </div>
  );
}
