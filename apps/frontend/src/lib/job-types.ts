export interface JobListing {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  remote_type: "onsite" | "remote" | "hybrid" | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string | null;
  job_type: "full_time" | "part_time" | "contract" | "internship" | null;
  experience_level:
    | "entry"
    | "junior"
    | "mid"
    | "senior"
    | "lead"
    | "graduate"
    | null;
  posted_date: string | null;
  external_url: string | null;
  is_active: boolean;
  extracted_keywords: string[];
}

export type ApplicationStatus =
  | "not_applied"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export interface JobMatch {
  id: string;
  resume_id: string;
  job_listing_id: string;
  match_score: number;
  skill_match_score: number | null;
  experience_match_score: number | null;
  location_match_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  application_status: ApplicationStatus;
  job_listing: JobListing;
}
