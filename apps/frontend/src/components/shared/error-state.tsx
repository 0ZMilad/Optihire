import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center",
        className
      )}
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" aria-hidden />
      </div>
      <div className="mx-auto mt-4 max-w-md space-y-1">
        <h2 className="text-base font-semibold text-destructive">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
