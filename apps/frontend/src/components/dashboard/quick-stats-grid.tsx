import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileText,
  TrendingUp,
} from "lucide-react";
import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getScoreBadgeClass, getScoreTierLabel } from "@/lib/score-utils";

interface QuickStatsGridProps {
  className?: string;
  resumesCount: number;
  readyResumesCount: number;
  auditsCount: number;
  latestAuditScore: number | null;
  resumesLoading?: boolean;
  auditsLoading?: boolean;
  resumesError?: string | null;
  auditsError?: string | null;
  atsExpanded?: boolean;
  onToggleATS?: () => void;
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  loading,
  error,
  children,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-xs transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : error ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-destructive">Unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">{value}</span>
            {children}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {helper}
          </p>
        </>
      )}
    </div>
  );
}

export default memo(function QuickStatsGrid({
  className,
  resumesCount,
  readyResumesCount,
  auditsCount,
  latestAuditScore,
  resumesLoading = false,
  auditsLoading = false,
  resumesError,
  auditsError,
  atsExpanded = false,
  onToggleATS,
}: QuickStatsGridProps) {
  return (
    <section
      className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className || ""}`}
      aria-label="Workspace readiness summary"
    >
      <MetricCard
        label="Resume library"
        value={String(resumesCount)}
        helper={`${readyResumesCount} parsed and ready for audits`}
        icon={<FileText className="size-4" aria-hidden />}
        loading={resumesLoading}
        error={resumesError}
      />
      <MetricCard
        label="ATS audits"
        value={String(auditsCount)}
        helper={
          latestAuditScore === null
            ? "Run an audit to get score guidance"
            : "Saved audit reports"
        }
        icon={<BarChart3 className="size-4" aria-hidden />}
        loading={auditsLoading}
        error={auditsError}
      />
      <div
        className={`rounded-lg border bg-card p-5 shadow-xs transition-colors ${
          atsExpanded ? "bg-muted/40" : "hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Latest ATS score
          </span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
            {onToggleATS && (
              <button
                onClick={onToggleATS}
                aria-label={
                  atsExpanded
                    ? "Hide ATS score details"
                    : "Show ATS score details"
                }
                aria-expanded={atsExpanded}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
              >
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    atsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          {auditsLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : latestAuditScore === null ? (
            <span className="text-2xl font-semibold">--</span>
          ) : (
            <>
              <span className="text-2xl font-semibold tabular-nums">
                {latestAuditScore}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getScoreBadgeClass(latestAuditScore)}`}
              >
                {getScoreTierLabel(latestAuditScore)}
              </span>
            </>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {latestAuditScore === null
            ? "Expand this card for audit guidance"
            : "Expand to view the score breakdown"}
        </p>
      </div>
      <MetricCard
        label="Application tracking"
        value={auditsCount > 0 ? "Ready" : "Locked"}
        helper={
          auditsCount > 0
            ? "Update status inside Job Matches"
            : "Run an audit before reviewing matches"
        }
        icon={<Briefcase className="size-4" aria-hidden />}
        loading={auditsLoading}
        error={auditsError}
      >
        {auditsCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-score-strong">
            <CheckCircle2 className="size-3" aria-hidden />
            status controls active
          </span>
        )}
      </MetricCard>
    </section>
  );
});
