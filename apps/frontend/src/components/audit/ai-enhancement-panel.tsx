"use client";

import {
  ArrowRight,
  LayoutList,
  Lightbulb,
  ListChecks,
  Quote,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIEnhancementPayload } from "@/middle-service/audit";

interface AIEnhancementPanelProps {
  payload: AIEnhancementPayload;
}

export function AIEnhancementPanel({ payload }: AIEnhancementPanelProps) {
  const {
    role_fit_summary,
    bullet_rewrites = [],
    keyword_context_tips = [],
    priority_gap_feedback = [],
    section_feedback = [],
  } = payload;

  return (
    <div className="space-y-8">
      {/* ── Role Fit Summary ─────────────────────────────── */}
      {role_fit_summary && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-800/40 dark:bg-violet-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="size-3.5 text-violet-600 dark:text-violet-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Role Fit Summary
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {role_fit_summary}
          </p>
        </div>
      )}

      {priority_gap_feedback.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-semibold">Top Improvements</h3>
            <Badge
              variant="outline"
              className="text-xs border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400"
            >
              {priority_gap_feedback.length}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {priority_gap_feedback.map((item, idx) => (
              <div
                key={`${idx}-${item.slice(0, 24)}`}
                className="flex items-start gap-3 rounded-xl border bg-card p-4"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {idx + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {section_feedback.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutList className="size-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold">Section Coaching</h3>
            <Badge variant="outline" className="text-xs">
              {section_feedback.length}
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {section_feedback.map((item, idx) => (
              <div
                key={`${idx}-${item.section_name}`}
                className="space-y-3 rounded-xl border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.section_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Focus
                  </Badge>
                </div>

                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {item.focus}
                </p>

                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Suggested Update
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.suggested_update}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bullet Rewrites ──────────────────────────────── */}
      {bullet_rewrites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-semibold">Bullet Rewrites</h3>
            <Badge
              variant="outline"
              className="text-xs border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400"
            >
              {bullet_rewrites.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {bullet_rewrites.map((rewrite, idx) => (
              <div
                key={`${rewrite.original}-${rewrite.rewritten}-${idx}`}
                className="rounded-xl border bg-card overflow-hidden"
              >
                {/* Before / After */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-0">
                  {/* Before */}
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Original
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-through decoration-red-400/70">
                      {rewrite.original}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center px-2">
                    <ArrowRight className="size-4 text-muted-foreground/40" />
                  </div>

                  {/* After */}
                  <div className="p-4 bg-emerald-50/60 border-t sm:border-t-0 sm:border-l border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
                      Suggested
                    </p>
                    <p className="text-sm text-foreground leading-relaxed font-medium">
                      {rewrite.rewritten}
                    </p>
                  </div>
                </div>

                {/* Rationale */}
                {rewrite.rationale && (
                  <div className="px-4 py-2.5 border-t bg-muted/30 flex items-start gap-2">
                    <Lightbulb className="size-3 text-amber-500 shrink-0 mt-px" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rewrite.rationale}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Keyword Context Tips ─────────────────────────── */}
      {keyword_context_tips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <h3 className="text-sm font-semibold">
              How to Use Missing Keywords
            </h3>
            <Badge variant="outline" className="text-xs">
              {keyword_context_tips.length}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {keyword_context_tips.map((tip, idx) => (
              <div
                key={`${tip.keyword}-${tip.suggested_section}-${idx}`}
                className="rounded-xl border bg-card p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {tip.keyword}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      "text-muted-foreground border-border bg-muted/40"
                    )}
                  >
                    Add to {tip.suggested_section}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Example: </span>
                  {tip.example_usage}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {priority_gap_feedback.length === 0 &&
        section_feedback.length === 0 &&
        bullet_rewrites.length === 0 &&
        keyword_context_tips.length === 0 &&
        !role_fit_summary && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="size-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No AI suggestions available.</p>
          </div>
        )}
    </div>
  );
}
