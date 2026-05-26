"use client";

import {
  Activity,
  CheckCircle2,
  Clock,
  Minus,
  Pause,
  Play,
  RotateCcw,
  StickyNote,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS_META } from "@/lib/status-styles";

interface DashboardWidgetsProps {
  className?: string;
}

export default function DashboardWidgets({ className }: DashboardWidgetsProps) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(10);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const saved = localStorage.getItem("dash_notes");
    if (saved) setNotes(saved);
    const goal = localStorage.getItem("weekly_goal");
    if (goal) setWeeklyGoal(Number(goal));
  }, []);

  const notesTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      localStorage.setItem("dash_notes", notes);
    }, 500);
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    };
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("weekly_goal", String(weeklyGoal));
  }, [weeklyGoal]);

  const mm = useMemo(
    () => String(Math.floor(seconds / 60)).padStart(2, "0"),
    [seconds]
  );
  const ss = useMemo(() => String(seconds % 60).padStart(2, "0"), [seconds]);

  const toggleRunning = useCallback(() => setRunning((v) => !v), []);
  const resetTimer = useCallback(() => {
    setRunning(false);
    setSeconds(25 * 60);
  }, []);
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value),
    []
  );
  const handleGoalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setWeeklyGoal(Number(e.target.value)),
    []
  );

  const statusGuide = [
    { status: "not_applied" as const, Icon: Minus },
    { status: "applied" as const, Icon: CheckCircle2 },
    { status: "interviewing" as const, Icon: Clock },
    { status: "offer" as const, Icon: Trophy },
    { status: "rejected" as const, Icon: XCircle },
  ];

  return (
    <section
      className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className || ""}`}
      aria-label="Workspace tools"
    >
      <div className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Timer className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">Focus timer</span>
          </div>
          <div className="text-xs text-muted-foreground">Pomodoro</div>
        </div>
        <div
          className="mt-3 text-3xl font-mono tabular-nums tracking-tight"
          aria-live="polite"
          aria-atomic
        >
          {mm}:{ss}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleRunning}
            aria-pressed={running}
          >
            {running ? (
              <Pause className="mr-2 size-4" aria-hidden />
            ) : (
              <Play className="mr-2 size-4" aria-hidden />
            )}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="ghost" onClick={resetTimer}>
            <RotateCcw className="mr-2 size-4" aria-hidden /> Reset
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="inline-flex items-center gap-2">
          <StickyNote className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Quick notes</span>
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Interview prep, follow-ups, ideas..."
          className="mt-3 min-h-24 w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          aria-label="Quick notes"
        />
        <div className="mt-2 text-[11px] text-muted-foreground">
          Autosaved locally
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="inline-flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">
            Weekly application goal
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={40}
            value={weeklyGoal}
            onChange={handleGoalChange}
            className="w-full accent-foreground"
            aria-label="Applications per week goal"
          />
          <span className="w-10 text-right text-sm tabular-nums">
            {weeklyGoal}
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/80"
            style={{ width: `${Math.min((weeklyGoal / 40) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-xs">
        <div className="inline-flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">
            Application status guide
          </span>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {statusGuide.map(({ status, Icon }) => {
            const meta = APPLICATION_STATUS_META[status];
            return (
              <li key={status} className="flex items-center gap-2">
                <Icon className={`size-3.5 ${meta.iconClass}`} aria-hidden />
                <span className="font-medium">{meta.shortLabel}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          These labels appear on each curated match so status is visible without
          relying on colour alone.
        </p>
      </div>
    </section>
  );
}
