"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, StickyNote, Target, Activity, Play, Pause, RotateCcw } from "lucide-react";

interface DashboardWidgetsProps {
  className?: string;
}

export default function DashboardWidgets({ className }: DashboardWidgetsProps) {
  // Widgets state
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [showActivity, setShowActivity] = useState(true);

  // Timer effect
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Notes persistence
  useEffect(() => {
    const saved = localStorage.getItem("dash_notes");
    if (saved) setNotes(saved);
    const goal = localStorage.getItem("weekly_goal");
    if (goal) setWeeklyGoal(Number(goal));
  }, []);

  useEffect(() => {
    localStorage.setItem("dash_notes", notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("weekly_goal", String(weeklyGoal));
  }, [weeklyGoal]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <section className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className || ""}`} aria-label="Interactive widgets">
      {/* Focus Timer */}
      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Timer className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">Focus timer</span>
          </div>
          <div className="text-xs text-muted-foreground">Pomodoro</div>
        </div>
        <div className="mt-3 text-3xl font-mono tabular-nums tracking-tight" aria-live="polite" aria-atomic>
          {mm}:{ss}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRunning((v) => !v)} aria-pressed={running}>
            {running ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
            <RotateCcw className="mr-2 size-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="rounded-xl border p-6">
        <div className="inline-flex items-center gap-2">
          <StickyNote className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Quick notes</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Interview prep, follow-ups, ideas…"
          className="mt-3 w-full min-h-24 rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          aria-label="Quick notes"
        />
        <div className="mt-2 text-[11px] text-muted-foreground">Autosaved locally</div>
      </div>

      {/* Weekly Goal */}
      <div className="rounded-xl border p-6">
        <div className="inline-flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Weekly application goal</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={40}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
            className="w-full accent-foreground"
            aria-label="Applications per week goal"
          />
          <span className="w-10 text-right text-sm tabular-nums">{weeklyGoal}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground/80" style={{ width: `${Math.min(weeklyGoal / 40 * 100, 100)}%` }} />
        </div>
      </div>

      {/* Activity Toggle */}
      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">Recent activity</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowActivity((v) => !v)} aria-expanded={showActivity}>
            {showActivity ? "Hide" : "Show"}
          </Button>
        </div>
        {showActivity && (
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>Submitted to Acme Corp</span>
              <span className="text-xs text-muted-foreground">2h ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Updated resume summary</span>
              <span className="text-xs text-muted-foreground">1d ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Interview scheduled</span>
              <span className="text-xs text-muted-foreground">Mon</span>
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}
