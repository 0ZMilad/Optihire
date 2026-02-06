// Enhanced Resume Builder exports
export { default as EnhancedResumeBuilderUI } from "./EnhancedResumeBuilderUI";
export { default as EnhancedProfileForm } from "./EnhancedProfileForm";
export { default as EnhancedExperienceForm } from "./EnhancedExperienceForm";
export { default as EnhancedEducationForm } from "./EnhancedEducationForm";
export { default as EnhancedSkillsForm } from "./EnhancedSkillsForm";
export { default as EnhancedProjectsForm } from "./EnhancedProjectsForm";
export { default as EnhancedCertificationsForm } from "./EnhancedCertificationsForm";
export { default as EnhancedResumePreview } from "./EnhancedResumePreview";
export { default as SaveStatusIndicator } from "./SaveStatusIndicator";

// Type exports
export type {
  ResumeBuilderData,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  SaveStatus,
  ResumeSection,
  DraftMetadata,
  ResumeDraft,
} from "./types";

// Factory function exports
export {
  createEmptyResumeData,
  createEmptyPersonalInfo,
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  createEmptyProject,
  createEmptyCertification,
  DEFAULT_SECTION_ORDER,
} from "./types";

