"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface AvatarProps {
  src?: string;
  name?: string;
  isAi?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  statusIndicator?: boolean;
}

export function Avatar({
  src,
  name,
  isAi = false,
  size = "md",
  className,
  statusIndicator = false,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center font-semibold overflow-hidden border transition-all duration-300 shadow-md",
          sizeClasses[size],
          isAi
            ? "bg-gradient-to-tr from-indigo-900 via-indigo-600 to-purple-500 text-white border-indigo-400/40 shadow-indigo-500/20"
            : "bg-zinc-800 text-zinc-200 border-white/10",
          className
        )}
      >
        {isAi ? (
          <Bot className={cn("text-indigo-100 animate-pulse-slow", iconSizes[size])} />
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name || "User Avatar"} className="w-full h-full object-cover" />
        ) : (
          <User className={cn("text-zinc-400", iconSizes[size])} />
        )}
      </div>

      {statusIndicator && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#09090B] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
      )}
    </div>
  );
}
