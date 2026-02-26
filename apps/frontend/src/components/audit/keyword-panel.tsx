"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface KeywordPanelProps {
  matched: string[];
  missing: string[];
}

export function KeywordPanel({ matched, missing }: KeywordPanelProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Missing — high priority */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-red-600" />
          <h3 className="font-semibold text-red-700 dark:text-red-400">
            Missing Requirements
          </h3>
          <span className="ml-auto text-xs font-medium text-red-600/70 tabular-nums">
            {missing.length} found
          </span>
        </div>
        <p className="text-xs text-red-600/80 dark:text-red-400/70 mb-4">
          Add these to your Experience or Skills section if you possess them.
        </p>
        <div className="flex flex-wrap gap-2">
          {missing.length === 0 ? (
            <span className="text-sm text-red-500/60 italic">None — great coverage!</span>
          ) : (
            missing.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 bg-white/60 dark:bg-red-950/40"
              >
                {kw}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            Matched Requirements
          </h3>
          <span className="ml-auto text-xs font-medium text-emerald-600/70 tabular-nums">
            {matched.length} found
          </span>
        </div>
        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mb-4">
          Your resume already targets these keywords successfully.
        </p>
        <div className="flex flex-wrap gap-2">
          {matched.length === 0 ? (
            <span className="text-sm text-emerald-500/60 italic">No matches yet.</span>
          ) : (
            matched.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-white/60 dark:bg-emerald-950/40"
              >
                {kw}
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
