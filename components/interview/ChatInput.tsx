"use client";

import React, { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, CornerDownLeft, AlertCircle, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { VoiceMicButton } from "./VoiceMicButton";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ─── Transcription-complete flash ─────────────────────────────────────────────

function TranscriptFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="flash"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono"
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.4 }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          Transcription added — review &amp; edit before sending
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your response or code solution... (Shift + Enter for new line)",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Voice callbacks ──────────────────────────────────────────────────────────

  const handleTranscript = useCallback((transcript: string) => {
    setText(transcript);
  }, []);

  const handleComplete = useCallback((finalText: string) => {
    if (!finalText) return;
    setText(finalText);
    // Flash confirmation
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setShowFlash(true);
    flashTimerRef.current = setTimeout(() => setShowFlash(false), 3500);
    // Refocus textarea so candidate can edit immediately
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const { isRecording, isSupported, errorMessage, elapsedSeconds, toggle } =
    useVoiceInput({
      onTranscript: handleTranscript,
      onComplete: handleComplete,
    });

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
    setShowFlash(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Whether this looks like a code-heavy question ─────────────────────────────
  // (placeholder text switches to "code" mode when disabled is false and
  //  the default placeholder contains "code")
  const isCodeContext = placeholder.toLowerCase().includes("code");

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      {/* ── Main input bar ── */}
      <div
        className={cn(
          "relative flex items-end rounded-2xl bg-[#18181B]/90 border p-2 shadow-2xl backdrop-blur-xl transition-all duration-300",
          isRecording
            ? "border-indigo-500/70 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            : "border-white/10 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.25)]"
        )}
      >
        {/* Screen-reader live region for recording state */}
        <span className="sr-only" aria-live="assertive" aria-atomic="true">
          {isRecording ? "Voice recording started. Speak now." : ""}
        </span>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          aria-label="Answer input"
          className="w-full bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none disabled:opacity-50 font-sans"
        />

        {/* ── Button row ── */}
        <div className="flex items-center gap-2 pb-1 pr-1 shrink-0">
          {/* Mic button */}
          <VoiceMicButton
            isRecording={isRecording}
            isSupported={isSupported}
            elapsedSeconds={elapsedSeconds}
            disabled={disabled}
            onToggle={toggle}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={cn(
              "flex items-center justify-center p-3 rounded-xl transition-all duration-300 font-semibold text-white shadow-lg",
              text.trim() && !disabled
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 scale-100 hover:scale-105"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-60"
            )}
            aria-label="Send answer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Status / hint bar ── */}
      <div className="flex flex-wrap items-center justify-between px-3 mt-2 gap-y-1 text-[11px] text-zinc-400 font-mono min-h-[20px]">
        {/* Left: error → transcription flash → voice hint → default hint */}
        <span className="flex items-center gap-1.5 min-h-[16px]">
          {errorMessage ? (
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errorMessage}
            </span>
          ) : showFlash ? (
            <TranscriptFlash show={showFlash} />
          ) : isRecording ? (
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Mic className="w-3 h-3 text-indigo-400 animate-pulse" />
              Listening… speak your answer clearly
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI evaluation engine active
              {isCodeContext && isSupported && (
                <span className="ml-2 text-amber-400/70">
                  · Voice best for explanations, not code
                </span>
              )}
            </span>
          )}
        </span>

        {/* Right: keyboard hint */}
        <span className="flex items-center gap-1">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10 font-sans font-bold text-[10px]">
            Enter
          </kbd>{" "}
          <CornerDownLeft className="w-3 h-3 inline" /> to send
        </span>
      </div>
    </form>
  );
}
