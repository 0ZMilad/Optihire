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
  experience_level: "entry" | "junior" | "mid" | "senior" | "lead" | null;
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
  is_saved: boolean;
  is_hidden: boolean;
  application_status: ApplicationStatus;
  job_listing: JobListing;
}

export const MOCK_JOB_MATCHES: JobMatch[] = [
  {
    id: "jm-001",
    resume_id: "resume-001",
    job_listing_id: "jl-001",
    match_score: 92,
    skill_match_score: 95,
    experience_match_score: 90,
    location_match_score: 88,
    matched_skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    missing_skills: ["GraphQL", "AWS"],
    is_saved: true,
    is_hidden: false,
    application_status: "applied",
    job_listing: {
      id: "jl-001",
      job_title: "Senior Frontend Engineer",
      company_name: "Stripe",
      location: "San Francisco, CA",
      remote_type: "hybrid",
      salary_min: 160000,
      salary_max: 220000,
      salary_currency: "USD",
      description: "Build the next generation of payment interfaces used by millions of businesses worldwide.",
      job_type: "full_time",
      experience_level: "senior",
      posted_date: "2026-02-28",
      external_url: "https://stripe.com/jobs",
      is_active: true,
      extracted_keywords: ["TypeScript", "React", "Next.js", "Node.js", "GraphQL", "AWS", "PostgreSQL"],
    },
  },
  {
    id: "jm-002",
    resume_id: "resume-001",
    job_listing_id: "jl-002",
    match_score: 87,
    skill_match_score: 90,
    experience_match_score: 82,
    location_match_score: 100,
    matched_skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "Git", "Figma"],
    missing_skills: ["Vue.js", "Docker"],
    is_saved: false,
    is_hidden: false,
    application_status: "not_applied",
    job_listing: {
      id: "jl-002",
      job_title: "Full Stack Developer",
      company_name: "Linear",
      location: null,
      remote_type: "remote",
      salary_min: 130000,
      salary_max: 180000,
      salary_currency: "USD",
      description: "Help us build the best project management tool for software teams.",
      job_type: "full_time",
      experience_level: "mid",
      posted_date: "2026-03-01",
      external_url: "https://linear.app/jobs",
      is_active: true,
      extracted_keywords: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Vue.js", "Docker"],
    },
  },
  {
    id: "jm-003",
    resume_id: "resume-001",
    job_listing_id: "jl-003",
    match_score: 81,
    skill_match_score: 85,
    experience_match_score: 78,
    location_match_score: null,
    matched_skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs"],
    missing_skills: ["Kubernetes", "Redis", "Celery"],
    is_saved: false,
    is_hidden: false,
    application_status: "interviewing",
    job_listing: {
      id: "jl-003",
      job_title: "Backend Engineer",
      company_name: "Vercel",
      location: "New York, NY",
      remote_type: "hybrid",
      salary_min: 140000,
      salary_max: 190000,
      salary_currency: "USD",
      description: "Scale our serverless infrastructure and developer platform.",
      job_type: "full_time",
      experience_level: "senior",
      posted_date: "2026-02-25",
      external_url: "https://vercel.com/careers",
      is_active: true,
      extracted_keywords: ["Python", "FastAPI", "Kubernetes", "Redis", "Docker", "PostgreSQL"],
    },
  },
  {
    id: "jm-004",
    resume_id: "resume-001",
    job_listing_id: "jl-004",
    match_score: 76,
    skill_match_score: 80,
    experience_match_score: 70,
    location_match_score: 75,
    matched_skills: ["React", "JavaScript", "CSS", "HTML", "Git"],
    missing_skills: ["React Native", "Swift", "Kotlin"],
    is_saved: false,
    is_hidden: false,
    application_status: "not_applied",
    job_listing: {
      id: "jl-004",
      job_title: "Software Engineer, Mobile & Web",
      company_name: "Notion",
      location: "San Francisco, CA",
      remote_type: "onsite",
      salary_min: 120000,
      salary_max: 165000,
      salary_currency: "USD",
      description: "Shape how people and teams organize their work and knowledge.",
      job_type: "full_time",
      experience_level: "mid",
      posted_date: "2026-02-20",
      external_url: "https://notion.so/careers",
      is_active: true,
      extracted_keywords: ["React", "React Native", "Swift", "Kotlin", "JavaScript"],
    },
  },
  {
    id: "jm-005",
    resume_id: "resume-001",
    job_listing_id: "jl-005",
    match_score: 69,
    skill_match_score: 72,
    experience_match_score: 65,
    location_match_score: null,
    matched_skills: ["TypeScript", "Node.js", "Git", "Agile"],
    missing_skills: ["Java", "Microservices", "Kafka", "Spring Boot"],
    is_saved: false,
    is_hidden: false,
    application_status: "not_applied",
    job_listing: {
      id: "jl-005",
      job_title: "Platform Engineer",
      company_name: "Shopify",
      location: null,
      remote_type: "remote",
      salary_min: 110000,
      salary_max: 155000,
      salary_currency: "USD",
      description: "Build and maintain the platform powering commerce for millions of merchants.",
      job_type: "full_time",
      experience_level: "mid",
      posted_date: "2026-03-02",
      external_url: "https://shopify.com/careers",
      is_active: true,
      extracted_keywords: ["Java", "TypeScript", "Kafka", "Microservices", "Spring Boot"],
    },
  },
  {
    id: "jm-006",
    resume_id: "resume-001",
    job_listing_id: "jl-006",
    match_score: 58,
    skill_match_score: 60,
    experience_match_score: 55,
    location_match_score: 60,
    matched_skills: ["React", "TypeScript", "CSS"],
    missing_skills: ["Svelte", "SolidJS", "WebAssembly", "Rust"],
    is_saved: false,
    is_hidden: false,
    application_status: "rejected",
    job_listing: {
      id: "jl-006",
      job_title: "Frontend Infrastructure Engineer",
      company_name: "Figma",
      location: "San Francisco, CA",
      remote_type: "hybrid",
      salary_min: 150000,
      salary_max: 210000,
      salary_currency: "USD",
      description: "Work on the runtime, compiler, and rendering engine that powers Figma's design canvas.",
      job_type: "full_time",
      experience_level: "lead",
      posted_date: "2026-02-18",
      external_url: "https://figma.com/careers",
      is_active: true,
      extracted_keywords: ["Svelte", "SolidJS", "WebAssembly", "Rust", "React", "TypeScript"],
    },
  },
  {
    id: "jm-007",
    resume_id: "resume-001",
    job_listing_id: "jl-007",
    match_score: 84,
    skill_match_score: 88,
    experience_match_score: 80,
    location_match_score: 100,
    matched_skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "REST APIs", "Git"],
    missing_skills: ["PyTorch", "MLflow"],
    is_saved: false,
    is_hidden: false,
    application_status: "offer",
    job_listing: {
      id: "jl-007",
      job_title: "Machine Learning Engineer",
      company_name: "Anthropic",
      location: null,
      remote_type: "remote",
      salary_min: 180000,
      salary_max: 280000,
      salary_currency: "USD",
      description: "Advance AI safety research and build systems that are reliable, interpretable, and steerable.",
      job_type: "full_time",
      experience_level: "senior",
      posted_date: "2026-03-03",
      external_url: "https://anthropic.com/careers",
      is_active: true,
      extracted_keywords: ["Python", "PyTorch", "MLflow", "Machine Learning", "SQL"],
    },
  },
  {
    id: "jm-008",
    resume_id: "resume-001",
    job_listing_id: "jl-008",
    match_score: 73,
    skill_match_score: 75,
    experience_match_score: 72,
    location_match_score: null,
    matched_skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"],
    missing_skills: ["Go", "gRPC", "Terraform"],
    is_saved: true,
    is_hidden: false,
    application_status: "not_applied",
    job_listing: {
      id: "jl-008",
      job_title: "Software Engineer — Developer Tools",
      company_name: "GitHub",
      location: null,
      remote_type: "remote",
      salary_min: 135000,
      salary_max: 185000,
      salary_currency: "USD",
      description: "Build tools that help developers ship better software, faster.",
      job_type: "full_time",
      experience_level: "mid",
      posted_date: "2026-02-22",
      external_url: "https://github.com/about/careers",
      is_active: true,
      extracted_keywords: ["Go", "TypeScript", "gRPC", "Docker", "Terraform", "PostgreSQL"],
    },
  },
];
