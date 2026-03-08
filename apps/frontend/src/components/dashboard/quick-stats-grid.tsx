import { memo } from "react";
import { BarChart3, CheckCircle2, Briefcase, TrendingUp, ArrowUpRight, ChevronDown } from "lucide-react";

interface QuickStatsGridProps {
  className?: string;
  atsExpanded?: boolean;
  onToggleATS?: () => void;
}

export default memo(function QuickStatsGrid({ className, atsExpanded = false, onToggleATS }: QuickStatsGridProps) {
  return (
    <section className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Applications</span>
          <Briefcase className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold">24</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3" /> 8%
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div className="h-full w-3/5 rounded-full bg-foreground/80"></div>
        </div>
      </div>

      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Interviews</span>
          <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold">6</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3" /> 12%
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-foreground/80"></div>
        </div>
      </div>

      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Offers</span>
          <CheckCircle2 className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold">2</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3" /> 1 new
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-foreground/80"></div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-6 transition-colors ${
          atsExpanded ? "bg-muted/40" : "hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg. resume score</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
            {onToggleATS && (
              <button
                onClick={onToggleATS}
                aria-label={atsExpanded ? "Hide ATS score details" : "Show ATS score details"}
                aria-expanded={atsExpanded}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <span className="text-2xl font-semibold">78%</span>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3" /> +4
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div className="h-full w-4/5 rounded-full bg-foreground/80"></div>
        </div>
      </div>
    </section>
  );
});
