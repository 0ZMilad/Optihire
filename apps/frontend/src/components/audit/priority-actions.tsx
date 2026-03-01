"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { PriorityAction } from "@/middle-service/audit";

interface PriorityActionsProps {
  actions: PriorityAction[];
}

const PRIORITY_META: Record<
  PriorityAction["priority"],
  { label: string; dot: string; border: string; bg: string; text: string }
> = {
  critical: {
    label: "Critical",
    dot: "bg-red-700",
    border: "border-border",
    bg: "bg-muted/40",
    text: "text-foreground",
  },
  high: {
    label: "High",
    dot: "bg-amber-700",
    border: "border-border",
    bg: "bg-muted/30",
    text: "text-foreground",
  },
  medium: {
    label: "Medium",
    dot: "bg-blue-600",
    border: "border-border",
    bg: "bg-muted/30",
    text: "text-foreground",
  },
  low: {
    label: "Low",
    dot: "bg-muted-foreground/40",
    border: "border-border",
    bg: "bg-muted/20",
    text: "text-foreground",
  },
};

export function PriorityActions({ actions }: PriorityActionsProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? actions : actions.slice(0, 5);
  const hasMore = actions.length > 5;

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 text-center">
        <CheckCircle2 className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          No critical action items — your resume is well optimized!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Action Items</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {actions.length} item{actions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {visible.map((action, i) => {
          const meta = PRIORITY_META[action.priority];
          return (
            <div
              key={`${action.priority}-${action.section}-${i}`}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm",
                meta.border,
                meta.bg,
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  meta.dot,
                )}
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className={cn("leading-snug", meta.text)}>
                  {action.action}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4 font-medium",
                      meta.text,
                      meta.border,
                    )}
                  >
                    {meta.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {action.section}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          {showAll ? (
            <>
              <ChevronUp className="size-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="size-3" />
              Show {actions.length - 5} more
            </>
          )}
        </button>
      )}
    </div>
  );
}
