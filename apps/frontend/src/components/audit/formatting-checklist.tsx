"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface ChecklistItem {
  label: string;
  passed: boolean;
  fixHint?: string;
}

interface FormattingChecklistProps {
  items: ChecklistItem[];
}

export function FormattingChecklist({ items }: FormattingChecklistProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold mb-4">Formatting &amp; Structure Checklist</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              "bg-muted/30"
            )}
          >
            {item.passed ? (
              <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-700/70" />
            ) : (
              <XCircle className="size-4 mt-0.5 shrink-0 text-red-700/70" />
            )}
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-medium",
                  "text-foreground"
                )}
              >
                {item.label}
              </span>
              {!item.passed && item.fixHint && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {item.fixHint}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
