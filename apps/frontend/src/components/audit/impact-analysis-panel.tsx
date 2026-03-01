"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import type { ImpactAnalysis as ImpactAnalysisType } from "@/middle-service/audit";

interface ImpactAnalysisPanelProps {
  impact: ImpactAnalysisType;
}

export function ImpactAnalysisPanel({ impact }: ImpactAnalysisPanelProps) {
  const ratio =
    impact.total_bullets > 0
      ? Math.round((impact.quantified_count / impact.total_bullets) * 100)
      : 0;

  const tierColor =
    impact.score >= 60
      ? "text-emerald-700"
      : impact.score >= 30
        ? "text-amber-700"
        : "text-red-700";

  const tierBg =
    impact.score >= 60
      ? "bg-emerald-700"
      : impact.score >= 30
        ? "bg-amber-700"
        : "bg-red-700";

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-muted-foreground" />
          <h3 className="font-semibold">Impact & Achievements</h3>
        </div>
        <span className={cn("text-lg font-bold tabular-nums", tierColor)}>
          {impact.score}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              tierBg,
            )}
            style={{ width: `${impact.score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {impact.quantified_count} of {impact.total_bullets} bullets
            quantified ({ratio}%)
          </span>
          <span>Target: 50%+</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">
            {impact.total_bullets}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Bullets
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">
            {impact.quantified_count}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            With Metrics
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">
            {impact.weak_examples.length}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Weak Starts
          </p>
        </div>
      </div>

      {/* Tips */}
      {impact.tips.length > 0 && (
        <div className="space-y-2">
          {impact.tips.map((tip, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 text-xs rounded-lg px-3 py-2",
                tip.toLowerCase().includes("keep it up") || tip.toLowerCase().includes("strong")
                  ? "bg-muted/40 border-l-2 border-l-emerald-700/60 text-foreground pl-3"
                  : "bg-muted/40 border-l-2 border-l-amber-700/60 text-foreground pl-3",
              )}
            >
              {tip.toLowerCase().includes("keep it up") || tip.toLowerCase().includes("strong") ? (
                <TrendingUp className="size-3.5 mt-0.5 shrink-0" />
              ) : (
                <TrendingDown className="size-3.5 mt-0.5 shrink-0" />
              )}
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strong examples */}
      {impact.strong_examples.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Strong bullet examples from your resume:
          </p>
          {impact.strong_examples.slice(0, 3).map((ex, i) => (
            <div
              key={i}
              className="text-xs bg-muted/40 rounded-lg px-3 py-2 text-foreground leading-relaxed"
            >
              {ex}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
