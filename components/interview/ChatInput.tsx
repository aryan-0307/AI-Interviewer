"use client";

import React, { useRef, useState } from "react";
import { Send, Sparkles, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your response or code solution... (Shift + Enter for new line)",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
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
          "relative flex items-end rounded-2xl bg-[#18181B]/90 border p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 border-white/10 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.25)]"
        )}
      >

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
        {/* Left: default hint */}
        <span className="flex items-center gap-1.5 min-h-[16px]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            AI evaluation engine active
          </span>
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
