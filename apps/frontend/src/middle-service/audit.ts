import { apiClient } from "./client";
import type { ResumeListItem } from "./types";

export interface AuditRequest {
  resume_id: string;
  job_description: string;
  job_title?: string;
}

export interface KeywordImportance {
  keyword: string;
  frequency: number;
  importance: "critical" | "high" | "medium" | "low";
  category: "hard_skill" | "soft_skill" | "tool" | "certification";
  found: boolean;
}

export interface CategorisedKeywords {
  hard_skill: { matched: string[]; missing: string[] };
  soft_skill: { matched: string[]; missing: string[] };
  tool: { matched: string[]; missing: string[] };
  certification: { matched: string[]; missing: string[] };
}

export interface ImpactAnalysis {
  score: number;
  quantified_count: number;
  total_bullets: number;
  strong_examples: string[];
  weak_examples: string[];
  tips: string[];
}

export interface ResumeMetrics {
  word_count: number;
  ideal_range: [number, number];
  length_verdict: "too_short" | "short" | "good" | "slightly_long" | "too_long";
  pronoun_count: number;
  section_count: number;
  bullet_count: number;
  avg_bullet_words: number;
}

export interface PriorityAction {
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  section: string;
}

export interface RepetitionFlag {
  word: string;
  count: number;
}

export interface SuggestionsPayload {
  categorized_keywords?: CategorisedKeywords;
  keyword_importance?: KeywordImportance[];
  impact_analysis?: ImpactAnalysis;
  resume_metrics?: ResumeMetrics;
  priority_actions?: PriorityAction[];
  repetition_flags?: RepetitionFlag[];
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  rationale: string;
}

export interface KeywordContextTip {
  keyword: string;
  suggested_section: string;
  example_usage: string;
}

export interface AIEnhancementPayload {
  bullet_rewrites: BulletRewrite[];
  keyword_context_tips: KeywordContextTip[];
  role_fit_summary: string;
}

export interface AuditResult {
  id: string;
  resume_id: string;
  job_description_id: string | null;
  overall_score: number;
  keyword_score: number;
  formatting_score: number;
  section_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  keyword_density: number | null;
  has_contact_info: boolean;
  has_summary: boolean;
  has_experience: boolean;
  has_education: boolean;
  has_skills: boolean;
  has_consistent_formatting: boolean;
  has_bullet_points: boolean;
  has_action_verbs: boolean;
  is_scannable: boolean;
  suggestions_payload: SuggestionsPayload | null;
  ai_enhancement: AIEnhancementPayload | null;
  analyzed_at: string;
}

export interface AuditContext {
  resume: ResumeListItem;
  jobDescription: string;
}

export async function runAudit(data: AuditRequest, aiEnhance = true): Promise<AuditResult> {
  const url = aiEnhance
    ? "/api/v1/analyses/audit?ai_enhance=true"
    : "/api/v1/analyses/audit";
  const response = await apiClient.post<AuditResult>(url, data);
  return response.data;
}

export async function getAuditResult(id: string): Promise<AuditResult> {
  const response = await apiClient.get<AuditResult>(
    `/api/v1/analyses/${id}`,
  );
  return response.data;
}

export async function getLatestAuditResult(): Promise<AuditResult | null> {
  const response = await apiClient.get<AuditResult | null>(
    "/api/v1/analyses/latest",
  );
  return response.data ?? null;
}

export async function listAuditResults(skip = 0, limit = 20): Promise<AuditResult[]> {
  const response = await apiClient.get<AuditResult[]>(
    `/api/v1/analyses?skip=${skip}&limit=${limit}`,
  );
  return response.data;
}

export async function deleteAuditResult(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/analyses/${id}`);
}
