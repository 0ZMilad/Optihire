import { Briefcase, Target } from "lucide-react";
import type { ApplicationStatus, JobMatch } from "@/lib/job-types";
import { getScoreTier, type ScoreTier } from "@/lib/score-utils";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { STATUS_ICON_MAP } from "./job-status-select";

interface JobsSummaryProps {
  matches: JobMatch[];
  filteredCount: number;
}

const SCORE_SUMMARY: {
  key: ScoreTier;
  label: string;
  className: string;
}[] = [
  {
    key: "strong",
    label: "Strong",
    className: "border-score-strong/30 bg-score-strong/10 text-score-strong",
  },
  {
    key: "good",
    label: "Good",
    className: "border-score-good/30 bg-score-good/10 text-score-good",
  },
  {
    key: "fair",
    label: "Fair",
    className: "border-score-fair/30 bg-score-fair/10 text-score-fair",
  },
  {
    key: "weak",
    label: "Needs work",
    className: "border-score-weak/30 bg-score-weak/10 text-score-weak",
  },
];

function getScoreCounts(matches: JobMatch[]) {
  return matches.reduce(
    (acc, match) => {
      acc[getScoreTier(match.match_score)] += 1;
      return acc;
    },
    { strong: 0, good: 0, fair: 0, weak: 0 } satisfies Record<ScoreTier, number>
  );
}

function getStatusCounts(matches: JobMatch[]) {
  return matches.reduce(
    (acc, match) => {
      acc[match.application_status] += 1;
      return acc;
    },
    {
      not_applied: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    } satisfies Record<ApplicationStatus, number>
  );
}

export function JobsSummary({ matches, filteredCount }: JobsSummaryProps) {
  const scoreCounts = getScoreCounts(matches);
  const statusCounts = getStatusCounts(matches);

  return (
    <section
      className="rounded-lg border bg-card p-4 shadow-xs"
      aria-label="Job match summary"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Target className="size-4 text-muted-foreground" aria-hidden />
            Match quality
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredCount} visible from {matches.length} loaded matches
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SCORE_SUMMARY.map((item) => (
            <div
              key={item.key}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                item.className
              )}
            >
              <span className="block text-lg font-semibold tabular-nums">
                {scoreCounts[item.key]}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="inline-flex items-center gap-2 text-sm font-medium">
          <Briefcase className="size-4 text-muted-foreground" aria-hidden />
          Application status
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {APPLICATION_STATUS_OPTIONS.map(([status, meta]) => {
            const StatusIcon = STATUS_ICON_MAP[status];
            return (
              <div
                key={status}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                  meta.badgeClass
                )}
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <StatusIcon
                    className={cn("size-3.5", meta.iconClass)}
                    aria-hidden
                  />
                  {meta.shortLabel}
                </span>
                <span className="font-semibold tabular-nums">
                  {statusCounts[status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
