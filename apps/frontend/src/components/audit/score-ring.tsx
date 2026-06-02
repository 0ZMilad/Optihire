"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

function getScoreTier(score: number) {
  if (score >= 80)
    return {
      label: "Highly Competitive",
      color: "text-emerald-600",
      stroke: "stroke-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    };
  if (score >= 50)
    return {
      label: "Needs Tailoring",
      color: "text-amber-600",
      stroke: "stroke-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    };
  return {
    label: "Major Gaps",
    color: "text-red-600",
    stroke: "stroke-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  };
}

export function ScoreRing({
  score,
  size = 180,
  strokeWidth = 12,
  className,
  showLabel = true,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const tier = getScoreTier(score);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? 0 : 1200;

    if (duration === 0) {
      setAnimatedScore(score);
      return;
    }

    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      aria-label={`${score} out of 100 score: ${tier.label}`}
      role="img"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-[stroke-dashoffset] duration-300 ease-out",
              tier.stroke
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums tracking-tight",
              tier.color
            )}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            / 100
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className={cn(
            "text-sm font-semibold px-3 py-1 rounded-full",
            tier.bg,
            tier.color
          )}
        >
          {tier.label}
        </span>
      )}
    </div>
  );
}
