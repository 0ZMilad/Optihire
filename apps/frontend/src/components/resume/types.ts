// ============================================================================
// Resume Builder Types - Enhanced data models for form state management
// ============================================================================

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  skillsUsed: string[];
  displayOrder: number;
}

export interface Education {
  id: string;
  institutionName: string;
  degreeType: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  gpa: string;
  achievements: string[];
  relevantCoursework: string[];
  displayOrder: number;
}

export interface Skill {
  id: string;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Project {
  id: string;
  projectName: string;
  role: string;
  description: string;
  technologiesUsed: string[];
  projectUrl: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  achievements: string[];
  displayOrder: number;
}

export interface Certification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  displayOrder: number;
}

// Main Resume Builder Data Structure
export interface ResumeBuilderData {
  // Unique identifier for the resume being built
  id: string | null;
  
  // Personal information
  personal: PersonalInfo;
  
  // Professional summary
  summary: string;
  
  // Dynamic sections
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  
  // Template and ordering
  templateId: string | null;
  sectionOrder: string[];
  
  // Metadata
  versionName: string;
  isPrimary: boolean;
}

// Draft metadata for persistence
export interface DraftMetadata {
  lastSaved: string;
  version: number;
  isAutoSave: boolean;
}

// Complete draft with data and metadata
export interface ResumeDraft {
  data: ResumeBuilderData;
  metadata: DraftMetadata;
}

// Auto-save configuration
export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  debounceMs: number;
}

// Save status for UI feedback
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Section types for ordering and tabs
export type ResumeSection = 
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications';

// Default section order
export const DEFAULT_SECTION_ORDER: ResumeSection[] = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
];

// ============================================================================
// Factory Functions for Creating Empty Items
// ============================================================================

export const createEmptyPersonalInfo = (): PersonalInfo => ({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
});

export const createEmptyExperience = (order: number = 0): WorkExperience => ({
  id: crypto.randomUUID(),
  companyName: '',
  jobTitle: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
  achievements: [],
  skillsUsed: [],
  displayOrder: order,
});

export const createEmptyEducation = (order: number = 0): Education => ({
  id: crypto.randomUUID(),
  institutionName: '',
  degreeType: '',
  fieldOfStudy: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  gpa: '',
  achievements: [],
  relevantCoursework: [],
  displayOrder: order,
});

export const createEmptySkill = (order: number = 0): Skill => ({
  id: crypto.randomUUID(),
  skillName: '',
  skillCategory: '',
  proficiencyLevel: 'intermediate',
  yearsOfExperience: null,
  isPrimary: false,
  displayOrder: order,
});

export const createEmptyProject = (order: number = 0): Project => ({
  id: crypto.randomUUID(),
  projectName: '',
  role: '',
  description: '',
  technologiesUsed: [],
  projectUrl: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  achievements: [],
  displayOrder: order,
});

export const createEmptyCertification = (order: number = 0): Certification => ({
  id: crypto.randomUUID(),
  certificationName: '',
  issuingOrganization: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
  displayOrder: order,
});

export const createEmptyResumeData = (): ResumeBuilderData => ({
  id: null,
  personal: createEmptyPersonalInfo(),
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  templateId: null,
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  versionName: 'Untitled Resume',
  isPrimary: false,
});

// ============================================================================
// Legacy type for backward compatibility
// ============================================================================

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  experience: string;
  skills: string;
}
