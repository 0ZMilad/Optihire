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
// System Types
// ============================================================================

export interface HealthCheck {
  status: string;
  message: string;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiValidationError {
  detail: ValidationError[];
}

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
