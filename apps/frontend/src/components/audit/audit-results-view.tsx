"use client";

import { Search, BarChart3, LayoutList, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "./score-ring";
import { SubScoreCard } from "./sub-score-card";
import { KeywordPanel } from "./keyword-panel";
import { FormattingChecklist } from "./formatting-checklist";
import type { AuditResult, AuditContext } from "@/middle-service/audit";

interface AuditResultsViewProps {
  result: AuditResult;
  context: AuditContext;
  onRunAnother: () => void;
}

export function AuditResultsView({
  result,
  context,
  onRunAnother,
}: AuditResultsViewProps) {
  const checklistItems = [
    {
      label: "Contact Information Present",
      passed: result.has_contact_info,
      fixHint: "Add your email, phone, and location to the header.",
    },
    {
      label: "Professional Summary",
      passed: result.has_summary,
      fixHint: "Add a 2-3 sentence summary at the top of your resume.",
    },
    {
      label: "Experience Section",
      passed: result.has_experience,
      fixHint: "Include a Work Experience section with your roles.",
    },
    {
      label: "Education Section",
      passed: result.has_education,
      fixHint: "Add your education credentials.",
    },
    {
      label: "Skills Section",
      passed: result.has_skills,
      fixHint: "List your key technical and soft skills.",
    },
    {
      label: "Consistent Formatting",
      passed: result.has_consistent_formatting,
      fixHint: "Use consistent fonts, spacing, and heading styles.",
    },
    {
      label: "Bullet Points Used",
      passed: result.has_bullet_points,
      fixHint: "Use bullet points to list achievements and responsibilities.",
    },
    {
      label: "Action Verbs Detected",
      passed: result.has_action_verbs,
      fixHint: 'Start bullet points with action verbs like "Led", "Built", "Improved".',
    },
    {
      label: "ATS-Scannable Format",
      passed: result.is_scannable,
      fixHint: "Avoid tables, images, and multi-column layouts.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 mb-1 text-muted-foreground"
            onClick={onRunAnother}
          >
            <ArrowLeft className="size-3.5" />
            New Audit
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            ATS Compatibility Report
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            <span className="font-medium text-foreground">
              {context.resume.version_name}
            </span>{" "}
            vs.{" "}
            <span className="font-medium text-foreground">
              {context.jobTitle || context.jobSnippet}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        {/* Main dial */}
        <div className="flex items-center justify-center rounded-xl border bg-card p-6">
          <ScoreRing score={result.overall_score} size={200} />
        </div>

        {/* Sub-score grid */}
        <div className="grid gap-4 sm:grid-cols-3 content-center">
          <SubScoreCard
            label="Keyword Match"
            score={result.keyword_score}
            icon={<Search className="size-4" />}
          />
          <SubScoreCard
            label="Formatting"
            score={result.formatting_score}
            icon={<BarChart3 className="size-4" />}
          />
          <SubScoreCard
            label="Section Score"
            score={result.section_score}
            icon={<LayoutList className="size-4" />}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Gap Analysis</h2>
        <KeywordPanel
          matched={result.matched_keywords}
          missing={result.missing_keywords}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">ATS Best Practices</h2>
        <FormattingChecklist items={checklistItems} />
      </div>
    </div>
  );
}
