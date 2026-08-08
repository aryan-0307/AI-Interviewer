"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Waveform bars ─────────────────────────────────────────────────────────────

const WAVEFORM_BARS = 5;

function AudioWaveform() {
  return (
    <span
      aria-hidden="true"
      className="flex items-center gap-[3px] h-4"
      title="Recording audio"
    >
      {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="block w-[3px] rounded-full bg-indigo-400"
          animate={{
            height: ["6px", "14px", "4px", "12px", "6px"],
          }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </span>
  );
}

// ─── Elapsed timer label ──────────────────────────────────────────────────────

function ElapsedTimer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span
      aria-live="polite"
      aria-label={`Recording duration: ${m} minutes ${s} seconds`}
      className="tabular-nums text-[11px] font-mono text-indigo-300 min-w-[28px] text-center"
    >
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ─── Pulsing ring behind mic ──────────────────────────────────────────────────

function PulseRing() {
  return (
    <>
      <motion.span
        className="absolute inset-0 rounded-xl bg-indigo-500/25"
        animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute inset-0 rounded-xl bg-purple-500/20"
        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
      />
    </>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface VoiceMicButtonProps {
  isRecording: boolean;
  isSupported: boolean;
  elapsedSeconds: number;
  disabled?: boolean;
  onToggle: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function VoiceMicButton({
  isRecording,
  isSupported,
  elapsedSeconds,
  disabled = false,
  onToggle,
}: VoiceMicButtonProps) {
  const ariaLabel = isRecording ? "Stop voice input" : "Start voice input";

  if (!isSupported) {
    return (
      <div className="relative group flex items-center">
        <button
          type="button"
          disabled
          aria-label="Voice input not supported in this browser"
          title="Voice input not supported in this browser"
          className="flex items-center justify-center p-3 rounded-xl bg-zinc-800/50 opacity-40 cursor-not-allowed"
        >
          <MicOff className="w-4 h-4 text-zinc-500" />
        </button>
        {/* Tooltip */}
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5",
            "whitespace-nowrap text-[11px] text-zinc-300 bg-zinc-800 border border-white/10",
            "rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
        >
          Voice input not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Timer + waveform — only visible while recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            key="voice-indicators"
            initial={{ opacity: 0, width: 0, x: -8 }}
            animate={{ opacity: 1, width: "auto", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 overflow-hidden"
            aria-live="polite"
            aria-label="Recording in progress"
          >
            <AudioWaveform />
            <ElapsedTimer seconds={elapsedSeconds} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <div className="relative flex items-center justify-center">
        {isRecording && <PulseRing />}

        <motion.button
          type="button"
          onClick={onToggle}
          disabled={disabled && !isRecording}
          aria-label={ariaLabel}
          aria-pressed={isRecording}
          whileHover={{ scale: disabled && !isRecording ? 1 : 1.06 }}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 z-10",
            isRecording
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40"
              : disabled
                ? "bg-zinc-800/60 text-zinc-600 cursor-not-allowed opacity-50"
                : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 border border-white/8"
          )}
        >
          <motion.div
            animate={isRecording ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
            transition={
              isRecording
                ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            <Mic className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
