"use client";

import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Ban,
  Hash,
  List,
} from "lucide-react";
import type { ResumeMetrics } from "@/middle-service/audit";
import type { RepetitionFlag } from "@/middle-service/audit";

interface ResumeMetricsPanelProps {
  metrics: ResumeMetrics;
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

export function ResumeMetricsPanel({
  metrics,
  repetition,
}: ResumeMetricsPanelProps) {
  const verdict = VERDICT_META[metrics.length_verdict];

  return (
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
          value={verdict.label}
          icon={verdict.icon}
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
  );
}
