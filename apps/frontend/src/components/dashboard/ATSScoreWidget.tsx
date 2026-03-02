"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Gauge, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestAuditResult, type AuditResult } from "@/middle-service/audit";
import { logger } from "@/lib/logger";

interface ATSScoreWidgetProps {
  className?: string;
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 70
      ? "bg-emerald-500 dark:bg-emerald-400"
      : value >= 45
        ? "bg-amber-500 dark:bg-amber-400"
        : "bg-rose-500 dark:bg-rose-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  return "Needs work";
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 45) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ATSScoreWidget({ className }: ATSScoreWidgetProps) {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLatest = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLatestAuditResult();
      setResult(data);
    } catch (err) {
      logger.error("Failed to fetch latest ATS result", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  return (
    <div className={`rounded-xl border p-6 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Gauge className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Latest ATS score</span>
        </div>
        {!loading && (
          <button
            onClick={fetchLatest}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh ATS score"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Could not load your score.</p>
          <Button size="sm" variant="ghost" className="mt-2 px-0" onClick={fetchLatest}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty state — no audits yet */}
      {!loading && !error && result === null && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">No audits run yet.</p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href="/dashboard/audit">
              Run your first audit
              <ArrowRight className="ml-2 size-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Score display */}
      {!loading && !error && result !== null && (
        <>
          {/* Overall score */}
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-semibold tabular-nums ${scoreColor(result.overall_score)}`}
              aria-label={`Overall ATS score: ${result.overall_score} out of 100`}
            >
              {result.overall_score}
            </span>
            <span className="text-sm text-muted-foreground">/&nbsp;100</span>
            <span className={`text-xs font-medium ${scoreColor(result.overall_score)}`}>
              {scoreLabel(result.overall_score)}
            </span>
          </div>

          {/* Sub-score bars */}
          <div className="mt-4 space-y-2.5">
            <ScoreBar label="Keywords" value={result.keyword_score} />
            <ScoreBar label="Formatting" value={result.formatting_score} />
            <ScoreBar label="Sections" value={result.section_score} />
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(result.analyzed_at)}
            </span>
            <Button asChild size="sm" variant="ghost" className="h-auto px-0 py-0 text-xs gap-1">
              <Link href="/dashboard/audit">
                New audit
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
