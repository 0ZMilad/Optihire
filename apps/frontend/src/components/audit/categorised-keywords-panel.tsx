"use client";

import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle2,
  User,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CategorisedKeywords as CategorisedKeywordsType } from "@/middle-service/audit";

interface CategorisedKeywordsPanelProps {
  categories: CategorisedKeywordsType;
}

const CATEGORY_META: Record<
  keyof CategorisedKeywordsType,
  {
    label: string;
    icon: React.ReactNode;
    matchColor: string;
    missColor: string;
  }
> = {
  tool: {
    label: "Tools & Technologies",
    icon: <Wrench className="size-3.5" />,
    matchColor: "border-border text-foreground bg-muted/30",
    missColor: "border-border text-muted-foreground bg-muted/20",
  },
  hard_skill: {
    label: "Hard Skills",
    icon: <Brain className="size-3.5" />,
    matchColor: "border-border text-foreground bg-muted/30",
    missColor: "border-border text-muted-foreground bg-muted/20",
  },
  soft_skill: {
    label: "Soft Skills",
    icon: <User className="size-3.5" />,
    matchColor: "border-border text-foreground bg-muted/30",
    missColor: "border-border text-muted-foreground bg-muted/20",
  },
  certification: {
    label: "Certifications",
    icon: <Award className="size-3.5" />,
    matchColor: "border-border text-foreground bg-muted/30",
    missColor: "border-border text-muted-foreground bg-muted/20",
  },
};

function CategoryRow({
  catKey,
  data,
}: {
  catKey: keyof CategorisedKeywordsType;
  data: { matched: string[]; missing: string[] };
}) {
  const meta = CATEGORY_META[catKey];
  const total = data.matched.length + data.missing.length;

  if (total === 0) return null;

  const matchRate =
    total > 0 ? Math.round((data.matched.length / total) * 100) : 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {data.matched.length}/{total}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                matchRate >= 70
                  ? "bg-emerald-700"
                  : matchRate >= 40
                    ? "bg-amber-700"
                    : "bg-red-700"
              )}
              style={{ width: `${matchRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {data.matched.map((kw) => (
          <Badge
            key={`m-${kw}`}
            variant="outline"
            className={cn("text-[11px]", meta.matchColor)}
          >
            <CheckCircle2 className="size-2.5 mr-1" />
            {kw}
          </Badge>
        ))}
        {data.missing.map((kw) => (
          <Badge
            key={`x-${kw}`}
            variant="outline"
            className={cn("text-[11px]", meta.missColor)}
          >
            <AlertTriangle className="size-2.5 mr-1" />
            {kw}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function CategorisedKeywordsPanel({
  categories,
}: CategorisedKeywordsPanelProps) {
  const order: (keyof CategorisedKeywordsType)[] = [
    "tool",
    "hard_skill",
    "soft_skill",
    "certification",
  ];

  const activeCategories = order.filter(
    (key) =>
      categories[key].matched.length > 0 || categories[key].missing.length > 0
  );

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <h3 className="font-semibold">Skill Gap Analysis</h3>
      {activeCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No categorised keywords detected.
        </p>
      ) : (
        activeCategories.map((key) => (
          <CategoryRow key={key} catKey={key} data={categories[key]} />
        ))
      )}
    </div>
  );
}
