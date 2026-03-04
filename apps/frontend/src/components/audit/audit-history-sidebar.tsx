"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock, FileText, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { AuditResult } from "@/middle-service/audit";
import type { ResumeListItem } from "@/middle-service/types";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getScoreTier(score: number) {
  if (score >= 80) return { ring: "border-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" };
  if (score >= 50) return { ring: "border-amber-400",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"   };
  return           { ring: "border-red-400",             badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"           };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface AuditHistorySidebarProps {
  history: AuditResult[];
  isLoading: boolean;
  resumes: ResumeListItem[];
  activeResultId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (result: AuditResult) => void;
  onDelete: (id: string) => Promise<void>;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function AuditHistorySidebar({
  history,
  isLoading,
  resumes,
  activeResultId,
  isOpen,
  onToggle,
  onSelect,
  onDelete,
}: AuditHistorySidebarProps) {
  const resumeMap = useMemo(
    () => new Map(resumes.map((r) => [r.id, r.version_name || r.full_name || "Unnamed Resume"])),
    [resumes],
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col shrink-0 border-l border-border bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-10",
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3.5 top-4 z-10 h-7 w-7 rounded-full border border-border bg-background shadow-sm hover:bg-muted"
        onClick={onToggle}
        aria-label={isOpen ? "Collapse history panel" : "Expand history panel"}
      >
        {isOpen ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Collapsed pill strip — show score badges vertically */}
      {!isOpen && (
        <div className="flex flex-col items-center gap-2 pt-10 px-1">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-7 rounded-full" />
              ))
            : history.slice(0, 8).map((item) => {
                const { ring, badge } = getScoreTier(item.overall_score);
                const isActive = item.id === activeResultId;
                return (
                  <button
                    key={item.id}
                    title={`Score ${item.overall_score} — ${formatDate(item.analyzed_at)}`}
                    onClick={() => onSelect(item)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 text-[10px] font-bold transition-transform hover:scale-110 focus:outline-none",
                      badge,
                      ring,
                      isActive && "ring-2 ring-ring ring-offset-1",
                    )}
                  >
                    {item.overall_score}
                  </button>
                );
              })}
        </div>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Audit History</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-2 space-y-1.5">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  </div>
                ))}

              {!isLoading && history.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No previous audits yet.</p>
                  <p className="text-xs text-muted-foreground/60">
                    Run your first audit to see results here.
                  </p>
                </div>
              )}

              {!isLoading &&
                history.map((item) => {
                  const { ring, badge } = getScoreTier(item.overall_score);
                  const isActive = item.id === activeResultId;
                  const isDeleting = deletingId === item.id;
                  const resumeName = resumeMap.get(item.resume_id) ?? "Unknown Resume";

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative rounded-lg border transition-all",
                        isActive
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-transparent hover:bg-muted/60",
                        isDeleting && "opacity-50 pointer-events-none",
                      )}
                    >
                      {/* Clickable content area */}
                      <button
                        onClick={() => onSelect(item)}
                        className="w-full text-left p-3 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                      >
                        {/* Resume name */}
                        <p
                          className="text-xs font-medium truncate text-foreground"
                          title={resumeName}
                        >
                          {resumeName}
                        </p>

                        {/* Date + time */}
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(item.analyzed_at)} · {formatTime(item.analyzed_at)}
                        </p>

                        {/* Score + sub-scores */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold",
                              badge,
                              ring,
                            )}
                          >
                            {item.overall_score}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            KW {item.keyword_score}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            FMT {item.formatting_score}
                          </span>
                        </div>
                      </button>

                      {/* Delete button — shown on hover */}
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        disabled={isDeleting}
                        aria-label="Delete audit result"
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus:outline-none focus-visible:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
