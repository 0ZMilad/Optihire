import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

const LOADING_STATE_KEYS = [
  "resume",
  "audit",
  "matches",
  "tracking",
  "filters",
  "review",
  "summary",
  "details",
];

export function LoadingState({ rows = 4, className }: LoadingStateProps) {
  const skeletonKeys = LOADING_STATE_KEYS.slice(0, rows);

  return (
    <div className={cn("space-y-4", className)} aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {skeletonKeys.map((key) => (
          <Skeleton key={`loading-state-${key}`} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
