import { BarChart3, CheckCircle2, Briefcase, TrendingUp, ArrowUpRight } from "lucide-react";

interface QuickStatsGridProps {
  className?: string;
}

export default function QuickStatsGrid({ className }: QuickStatsGridProps) {
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

      <div className="rounded-xl border p-4 hover:bg-muted/40 transition-colors">
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

      <div className="rounded-xl border p-4 hover:bg-muted/40 transition-colors">
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

      <div className="rounded-xl border p-4 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg. resume score</span>
          <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
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
}
