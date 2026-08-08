import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "Medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "Hard":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case "Expert":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    default:
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
  }
}
