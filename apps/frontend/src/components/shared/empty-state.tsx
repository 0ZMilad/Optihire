import { FileSearch } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-8 text-center shadow-xs sm:p-10",
        className
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon ?? <FileSearch className="size-5" aria-hidden />}
      </div>
      <div className="mx-auto mt-4 max-w-md space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
