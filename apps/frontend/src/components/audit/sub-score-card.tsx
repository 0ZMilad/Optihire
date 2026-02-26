"use client";

import { cn } from "@/lib/utils";
import { getScoreTier } from "./score-ring";

interface SubScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
}

export function SubScoreCard({ label, score, icon }: SubScoreCardProps) {
  const tier = getScoreTier(score);

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        <span className={cn("text-lg font-bold tabular-nums", tier.color)}>
          {score}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
