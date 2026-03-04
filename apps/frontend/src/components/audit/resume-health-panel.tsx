"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Ban,
  Hash,
  List,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";
import type { ImpactAnalysis } from "@/middle-service/audit";
import type { ResumeMetrics } from "@/middle-service/audit";
import type { RepetitionFlag } from "@/middle-service/audit";

interface ResumeHealthPanelProps {
  impact: ImpactAnalysis | null;
  metrics: ResumeMetrics | null;
  repetition: RepetitionFlag[];
}

const VERDICT_META: Record<
  ResumeMetrics["length_verdict"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  too_short: {
    label: "Too Short",
    color: "text-foreground",
    icon: <AlertCircle className="size-3.5 text-red-700/70" />,
  },
  short: {
    label: "A Bit Short",
    color: "text-foreground",
    icon: <AlertCircle className="size-3.5 text-amber-700/70" />,
  },
  good: {
    label: "Good Length",
    color: "text-foreground",
    icon: <CheckCircle2 className="size-3.5 text-emerald-700/70" />,
  },
  slightly_long: {
    label: "Slightly Long",
    color: "text-foreground",
    icon: <AlertCircle className="size-3.5 text-amber-700/70" />,
  },
  too_long: {
    label: "Too Long",
    color: "text-foreground",
    icon: <AlertCircle className="size-3.5 text-red-700/70" />,
  },
};

function MetricTile({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-tight">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export function ResumeHealthPanel({
  impact,
  metrics,
  repetition,
}: ResumeHealthPanelProps) {
  const impactRatio =
    impact && impact.total_bullets > 0
      ? Math.round((impact.quantified_count / impact.total_bullets) * 100)
      : 0;

  const impactTierColor =
    impact && impact.score >= 60
      ? "text-emerald-700"
      : impact && impact.score >= 30
        ? "text-amber-700"
        : "text-red-700";

  const impactTierBg =
    impact && impact.score >= 60
      ? "bg-emerald-700"
      : impact && impact.score >= 30
        ? "bg-amber-700"
        : "bg-red-700";

  const verdict = metrics ? VERDICT_META[metrics.length_verdict] : null;

  return (
    <div className="space-y-5">
      {/* ── Impact & Achievements ─────────────────────────── */}
      {impact && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-muted-foreground" />
              <h3 className="font-semibold">Impact & Achievements</h3>
            </div>
            <span className={cn("text-lg font-bold tabular-nums", impactTierColor)}>
              {impact.score}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  impactTierBg,
                )}
                style={{ width: `${impact.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {impact.quantified_count} of {impact.total_bullets} bullets
                quantified ({impactRatio}%)
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
      )}

      {/* ── Resume Metrics ────────────────────────────────── */}
      {metrics && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold">Resume Metrics</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <MetricTile
              label="Word Count"
              value={metrics.word_count.toLocaleString()}
              icon={<FileText className="size-3.5" />}
              sub={`Ideal: ${metrics.ideal_range[0]}–${metrics.ideal_range[1]}`}
            />
            <MetricTile
              label="Length"
              value={verdict!.label}
              icon={verdict!.icon}
            />
            <MetricTile
              label="Sections"
              value={metrics.section_count}
              icon={<Hash className="size-3.5" />}
              sub="Headers detected"
            />
            <MetricTile
              label="Bullet Points"
              value={metrics.bullet_count}
              icon={<List className="size-3.5" />}
            />
            <MetricTile
              label="Avg Bullet Length"
              value={`${metrics.avg_bullet_words} words`}
              icon={<List className="size-3.5" />}
              sub="Target: 10-20 words"
            />
            <MetricTile
              label="Pronouns (I/my)"
              value={metrics.pronoun_count}
              icon={
                metrics.pronoun_count > 3 ? (
                  <Ban className="size-3.5 text-red-700/70" />
                ) : (
                  <CheckCircle2 className="size-3.5 text-emerald-700/70" />
                )
              }
              sub={metrics.pronoun_count > 3 ? "Remove for ATS" : "Good"}
            />
          </div>

          {/* Repetition flags */}
          {repetition.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Overused Words
              </p>
              <div className="flex flex-wrap gap-1.5">
                {repetition.map((r) => (
                  <span
                    key={r.word}
                    className="inline-flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2 py-0.5 text-[11px] text-foreground"
                  >
                    <span className="font-medium">{r.word}</span>
                    <span className="text-muted-foreground">×{r.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
