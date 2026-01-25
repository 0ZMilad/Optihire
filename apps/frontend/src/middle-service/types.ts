/**
 * API Types - Mirror backend schemas
 * These types match your FastAPI backend schemas
 */

// ============================================================================
// User Types
// ============================================================================

export interface UserCreate {
  supabase_user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  preferred_roles?: string[];
  preferred_locations?: string[];
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  years_of_experience?: number;
  has_completed_onboarding?: boolean;
  is_active?: boolean;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  preferred_roles?: string[];
  preferred_locations?: string[];
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  years_of_experience?: number;
  has_completed_onboarding?: boolean;
  is_active?: boolean;
}

export interface UserRead {
  id: string;
  supabase_user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_salary_min: number | null;
  preferred_salary_max: number | null;
  years_of_experience: number | null;
  has_completed_onboarding: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  deleted_at: string | null;
}

// ============================================================================
// API Error Types
// ============================================================================

// Error types removed as they are unused.

// ============================================================================
// Resume Parsing Types
// ============================================================================

export interface ResumeUploadResponse {
  id: string;
  url: string;
  filename: string;
  stored_name: string;
  user_id: string;
  processing_status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message?: string;
}

export interface ResumeParseStatusResponse {
  id: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message?: string;
  created_at: string;
  updated_at: string;
  error_details?: string | null;
}

export interface ResumeRead {
  id: string;
  user_id: string;
  version_name: string;

  // File storage
  file_path: string | null;
  file_url: string | null;

  // Parsed Contact Info & Links
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  
  // Parsed Content
  professional_summary: string | null;
  raw_text: string | null;

  // File Metadata
  url: string;
  filename: string;
  stored_name: string;

  // System Status
  processing_status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message?: string;
  error_details?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Resume Section Types (Structured Data)
// ============================================================================

export interface ExperienceRead {
  id: string;
  resume_id: string;
  company_name: string;
  job_title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[];
  skills_used: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationRead {
  id: string;
  resume_id: string;
  institution_name: string;
  degree_type: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  gpa: number | null;
  achievements: string[];
  relevant_coursework: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillRead {
  id: string;
  resume_id: string;
  skill_name: string;
  skill_category: string | null;
  proficiency_level: string | null;
  years_of_experience: number | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface CertificationRead {
  id: string;
  resume_id: string;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  display_order: number;
  created_at: string;
}

export interface ProjectRead {
  id: string;
  resume_id: string;
  project_name: string;
  role: string | null;
  description: string | null;
  technologies_used: string[];
  project_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  achievements: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Complete resume with all parsed sections.
 * Use GET /api/v1/resumes/{id}/complete to fetch this.
 */
export interface ResumeComplete extends ResumeRead {
  // Template & ordering
  template_id: string | null;
  is_primary: boolean;
  section_order: Record<string, unknown> | null;
  content_hash: string | null;
  last_analyzed_at: string | null;
  deleted_at: string | null;
  file_url: string | null;
  
  // Parsed structured sections
  experiences: ExperienceRead[];
  education: EducationRead[];
  skills: SkillRead[];
  certifications: CertificationRead[];
  projects: ProjectRead[];
}
