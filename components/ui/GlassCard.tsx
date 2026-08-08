"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: "indigo" | "emerald" | "amber" | "rose" | "none";
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  glowColor = "indigo",
  ...props
}: GlassCardProps) {
  const glowStyles = {
    indigo: "hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]",
    emerald: "hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]",
    amber: "hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    rose: "hover:border-rose-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl bg-[#18181B]/70 backdrop-blur-xl border border-white/10 p-6 overflow-hidden transition-all duration-300",
        hoverEffect && "hover:bg-[#18181B]/90",
        hoverEffect && glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
