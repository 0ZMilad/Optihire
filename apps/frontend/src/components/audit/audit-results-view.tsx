"use client";

import {
  Search,
  BarChart3,
  LayoutList,
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  ListChecks,
  ShieldCheck,
  ActivitySquare,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "./score-ring";
import { KeywordPanel } from "./keyword-panel";
import { FormattingChecklist } from "./formatting-checklist";
import { PriorityActions } from "./priority-actions";
import { CategorisedKeywordsPanel } from "./categorised-keywords-panel";
import { ResumeHealthPanel } from "./resume-health-panel";
import { AIEnhancementPanel } from "./ai-enhancement-panel";
import type { AuditResult, AuditContext } from "@/middle-service/audit";

interface AuditResultsViewProps {
  result: AuditResult;
  context: AuditContext;
  onRunAnother: () => void;
}

function extractFirstLine(text: string): string {
  const firstLine = text.split(/\n/).find((l) => l.trim().length > 0) ?? "";
  return firstLine.length > 80 ? firstLine.slice(0, 80) + "…" : firstLine;
}

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b">
      <span className="flex items-center justify-center size-8 rounded-lg bg-muted text-muted-foreground shrink-0">
        {icon}
      </span>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {badge}
    </div>
  );
}

type TabId = "overview" | "actions" | "skills" | "health" | "coach";

export function AuditResultsView({
  result,
  context,
  onRunAnother,
}: AuditResultsViewProps) {
  const [jdExpanded, setJdExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const jdFirstLine = useMemo(() => extractFirstLine(context.jobDescription), [context.jobDescription]);

  // AI enhancement payload (opt-in career coach)
  const aiEnhancement = result.ai_enhancement ?? null;

  // v2 enriched data from suggestions_payload
  const payload = result.suggestions_payload;
  const categorisedKeywords = payload?.categorized_keywords ?? null;
  const impactAnalysis = payload?.impact_analysis ?? null;
  const resumeMetrics = payload?.resume_metrics ?? null;
  const priorityActions = payload?.priority_actions ?? [];
  const repetitionFlags = payload?.repetition_flags ?? [];

  const checklistItems = useMemo(() => [
    { label: "Contact Information Present", passed: result.has_contact_info, fixHint: "Add your email, phone, and location to the header." },
    { label: "Professional Summary", passed: result.has_summary, fixHint: "Add a 2-3 sentence summary at the top of your resume." },
    { label: "Experience Section", passed: result.has_experience, fixHint: "Include a Work Experience section with your roles." },
    { label: "Education Section", passed: result.has_education, fixHint: "Add your education credentials." },
    { label: "Skills Section", passed: result.has_skills, fixHint: "List your key technical and soft skills." },
    { label: "Consistent Formatting", passed: result.has_consistent_formatting, fixHint: "Keep most lines under 100 characters — long lines can confuse ATS parsers." },
    { label: "Bullet Points Used", passed: result.has_bullet_points, fixHint: "Use bullet points to list achievements and responsibilities." },
    { label: "Action Verbs Detected", passed: result.has_action_verbs, fixHint: 'Start bullet points with action verbs like "Led", "Built", "Improved".' },
    { label: "ATS-Scannable Format", passed: result.is_scannable, fixHint: "Use bullet points and keep lines under 100 characters for reliable ATS scanning." },
  ], [
    result.has_contact_info, result.has_summary, result.has_experience, result.has_education,
    result.has_skills, result.has_consistent_formatting, result.has_bullet_points,
    result.has_action_verbs, result.is_scannable,
  ]);

  const checklistPassCount = useMemo(() => checklistItems.filter((i) => i.passed).length, [checklistItems]);
  const criticalCount = useMemo(() => priorityActions.filter((a) => a.priority === "critical").length, [priorityActions]);

  const tabs = useMemo(() => ([
    { id: "overview" as TabId, label: "Overview", icon: <BarChart3 className="size-3.5" />, show: true },
    { id: "actions" as TabId, label: "Action Plan", icon: <ListChecks className="size-3.5" />, show: priorityActions.length > 0, alert: criticalCount > 0 ? String(criticalCount) : undefined },
    { id: "skills" as TabId, label: "Skills Gap", icon: <Search className="size-3.5" />, show: true },
    { id: "health" as TabId, label: "Resume Health", icon: <ActivitySquare className="size-3.5" />, show: !!impactAnalysis || !!resumeMetrics },
    { id: "coach" as TabId, label: "AI Coach", icon: <Sparkles className="size-3.5" />, show: !!aiEnhancement },
  ] as { id: TabId; label: string; icon: React.ReactNode; show: boolean; alert?: string }[]).filter((t) => t.show), [priorityActions.length, criticalCount, impactAnalysis, resumeMetrics, aiEnhancement]);

  return (
    <div className="space-y-5">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground shrink-0"
            onClick={onRunAnother}
          >
            <ArrowLeft className="size-3.5" />
            New Audit
          </Button>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <h1 className="text-sm font-semibold truncate">ATS Compatibility Report</h1>
        </div>

        {/* Context pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs font-normal text-muted-foreground"
            onClick={() => setJdExpanded((v) => !v)}
          >
            <FileText className="size-3" />
            {jdFirstLine ? jdFirstLine.slice(0, 30) + (jdFirstLine.length > 30 ? "…" : "") : "Job Description"}
            {jdExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </Button>
        </div>
      </div>

      {/* ── JD drawer ────────────────────────────────────────── */}
      {jdExpanded && (
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
          {context.jobDescription}
        </div>
      )}

      {/* ── Score summary bar ────────────────────────────────── */}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-col sm:flex-row items-center gap-0 divide-y sm:divide-y-0 sm:divide-x">
          {/* Overall */}
          <div className="flex items-center gap-4 px-6 py-4 shrink-0">
            <ScoreRing score={result.overall_score} size={72} strokeWidth={7} />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Overall Score</p>
              <p className="text-2xl font-bold tabular-nums">{result.overall_score}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
            </div>
          </div>

          {/* Sub-scores inline */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 w-full">
            {[
              { label: "Keywords", score: result.keyword_score, icon: <Search className="size-3.5" /> },
              { label: "Formatting", score: result.formatting_score, icon: <BarChart3 className="size-3.5" /> },
              { label: "Sections", score: result.section_score, icon: <LayoutList className="size-3.5" /> },
              ...(impactAnalysis
                ? [{ label: "Impact", score: impactAnalysis.score, icon: <Zap className="size-3.5" /> }]
                : []),
            ].map(({ label, score, icon }) => (
              <div key={label} className="flex items-center gap-2 min-w-[110px]">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {icon}
                      {label}
                    </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        score >= 80 ? "text-emerald-700" : score >= 50 ? "text-amber-700" : "text-red-700",
                      )}
                    >
                      {score}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        score >= 80 ? "bg-emerald-700" : score >= 50 ? "bg-amber-700" : "bg-red-700",
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab nav ──────────────────────────────────────────── */}
      <div role="tablist" aria-label="Audit report sections" className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.alert && (
              <span className="flex items-center justify-center size-4 rounded-full bg-red-700 text-white text-[10px] font-bold leading-none">
                {tab.alert}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab panels ───────────────────────────────────────── */}
      <div className="min-h-[400px]">

        {/* Overview */}
        {activeTab === "overview" && (
          <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview" className="space-y-6">
            {/* ATS Checklist — folded in from old ATS Checks tab */}
            <SectionHeader
              icon={<ShieldCheck className="size-4" />}
              title="ATS Best Practices"
              badge={
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs ml-auto",
                    checklistPassCount === checklistItems.length
                      ? "border-emerald-800/60 text-emerald-700"
                      : "border-amber-800/60 text-amber-700",
                  )}
                >
                  {checklistPassCount}/{checklistItems.length} passed
                </Badge>
              }
            />
            <FormattingChecklist items={checklistItems} />
          </div>
        )}

        {/* Action Plan */}
        {activeTab === "actions" && (
          <div role="tabpanel" id="tabpanel-actions" aria-labelledby="tab-actions" className="space-y-5">
            <SectionHeader
              icon={<ListChecks className="size-4" />}
              title="Action Plan"
              badge={
                criticalCount > 0 ? (
                  <Badge variant="destructive" className="text-xs">
                    {criticalCount} critical
                  </Badge>
                ) : undefined
              }
            />
            <PriorityActions actions={priorityActions} />
          </div>
        )}

        {/* Skills Gap */}
        {activeTab === "skills" && (
          <div role="tabpanel" id="tabpanel-skills" aria-labelledby="tab-skills" className="space-y-5">
            <SectionHeader
              icon={<Search className="size-4" />}
              title="Skills Gap Analysis"
              badge={
                <span className="text-xs text-muted-foreground ml-auto">
                  {result.matched_keywords.length} matched · {result.missing_keywords.length} missing
                </span>
              }
            />
            {categorisedKeywords ? (
              <CategorisedKeywordsPanel categories={categorisedKeywords} />
            ) : (
              <KeywordPanel
                matched={result.matched_keywords}
                missing={result.missing_keywords}
              />
            )}
          </div>
        )}

        {/* Resume Health (merged Impact + Metrics) */}
        {activeTab === "health" && (impactAnalysis || resumeMetrics) && (
          <div role="tabpanel" id="tabpanel-health" aria-labelledby="tab-health" className="space-y-5">
            <SectionHeader
              icon={<ActivitySquare className="size-4" />}
              title="Resume Health"
            />
            <ResumeHealthPanel
              impact={impactAnalysis}
              metrics={resumeMetrics}
              repetition={repetitionFlags}
            />
          </div>
        )}

        {/* AI Coach */}
        {activeTab === "coach" && aiEnhancement && (
          <div role="tabpanel" id="tabpanel-coach" aria-labelledby="tab-coach" className="space-y-5">
            <SectionHeader
              icon={<Sparkles className="size-4" />}
              title="AI Career Coach"
              badge={
                <Badge
                  variant="outline"
                  className="text-xs ml-auto border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400"
                >
                  Powered by Gemini
                </Badge>
              }
            />
            <AIEnhancementPanel payload={aiEnhancement} />
          </div>
        )}
      </div>
    </div>
  );
}
