"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { ChatMessageItem } from "@/types/interview";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageItem;
  userAvatar?: string;
  userName?: string;
}

export function ChatMessage({ message, userAvatar, userName }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex gap-4 p-4 md:p-5 rounded-2xl transition-colors duration-200",
        isAssistant
          ? "bg-[#18181B]/80 border border-white/10 backdrop-blur-xl shadow-glass-sm"
          : "bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-md ml-auto max-w-3xl"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <Avatar
          isAi={isAssistant}
          src={isAssistant ? undefined : userAvatar}
          name={isAssistant ? "AI Agent" : userName}
          size="md"
        />
      </div>

      {/* Message Content Body */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-zinc-300 flex items-center gap-2">
            {isAssistant ? (
              <>
                <span className="text-indigo-400 font-mono font-bold">AI Interviewer</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  GPT-4o Architect
                </span>
              </>
            ) : (
              <span className="text-zinc-200">{userName || "Candidate Response"}</span>
            )}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">{message.timestamp}</span>
        </div>

        {/* Content Render */}
        <div className="text-sm text-zinc-200 leading-relaxed space-y-2 font-sans whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Code Blocks (if present) */}
        {message.codeBlocks && message.codeBlocks.length > 0 && (
          <div className="space-y-3 pt-2">
            {message.codeBlocks.map((block, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-white/10 bg-[#09090B] font-mono text-xs shadow-inner"
              >
                {/* Code Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/5 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] uppercase tracking-wider text-zinc-300 font-bold">
                      {block.language}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(block.code, idx)}
                    className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                  >
                    {copiedCodeIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code Content */}
                <div className="p-4 overflow-x-auto text-indigo-200 bg-[#09090B]/90 font-mono">
                  <pre>
                    <code>{block.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
