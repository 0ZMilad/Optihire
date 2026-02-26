import { apiClient } from "./client";
import type { ResumeListItem } from "./types";

export interface AuditRequest {
  resume_id: string;
  job_description: string;
  job_title?: string;
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
  suggestions_payload: Record<string, unknown> | null;
  analyzed_at: string;
}

export interface AuditContext {
  resume: ResumeListItem;
  jobDescription: string;
}

export async function runAudit(data: AuditRequest): Promise<AuditResult> {
  const response = await apiClient.post<AuditResult>(
    "/api/v1/analysis/audit",
    data,
  );
  return response.data;
}

export async function getAuditResult(id: string): Promise<AuditResult> {
  const response = await apiClient.get<AuditResult>(
    `/api/v1/analysis/${id}`,
  );
  return response.data;
}
