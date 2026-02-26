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
              item.passed
                ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                : "bg-red-50/60 dark:bg-red-950/20"
            )}
          >
            {item.passed ? (
              <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="size-4 mt-0.5 shrink-0 text-red-500" />
            )}
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-medium",
                  item.passed ? "text-emerald-800 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                )}
              >
                {item.label}
              </span>
              {!item.passed && item.fixHint && (
                <span className="text-xs text-red-500/80 mt-0.5">
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
