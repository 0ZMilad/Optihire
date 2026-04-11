import type { ResumeBuilderData } from "@/components/resume/types";
import { DEFAULT_SECTION_ORDER } from "@/components/resume/types";
import type {
  ResumeComplete,
  ResumeListItem,
  ResumeRead,
} from "@/middle-service/types";

const SKILL_LEVEL_FALLBACK =
  "intermediate" satisfies ResumeBuilderData["skills"][number]["proficiencyLevel"];

export function mapResumeReadToListItem(resume: ResumeRead): ResumeListItem {
  return {
    id: resume.id,
    user_id: resume.user_id,
    version_name: resume.version_name,
    template_id: resume.template_id,
    is_primary: resume.is_primary,
    full_name: resume.full_name,
    email: resume.email,
    phone: resume.phone,
    location: resume.location,
    professional_summary: resume.professional_summary,
    processing_status: resume.processing_status,
    created_at: resume.created_at,
    updated_at: resume.updated_at,
  };
}

export function mapResumeCompleteToBuilderData(
  resume: ResumeComplete
): ResumeBuilderData {
  return {
    id: resume.id,
    versionName: resume.version_name,
    templateId: resume.template_id,
    isPrimary: resume.is_primary,
    personal: {
      fullName: resume.full_name ?? "",
      email: resume.email ?? "",
      phone: resume.phone ?? "",
      location: resume.location ?? "",
      linkedinUrl: resume.linkedin_url ?? "",
      githubUrl: resume.github_url ?? "",
      portfolioUrl: resume.portfolio_url ?? "",
    },
    summary: resume.professional_summary ?? "",
    experiences: resume.experiences.map((experience) => ({
      id: experience.id,
      companyName: experience.company_name,
      jobTitle: experience.job_title,
      location: experience.location ?? "",
      startDate: experience.start_date ?? "",
      endDate: experience.end_date ?? "",
      isCurrent: experience.is_current,
      description: experience.description ?? "",
      achievements: experience.achievements ?? [],
      skillsUsed: experience.skills_used ?? [],
      displayOrder: experience.display_order,
    })),
    education: resume.education.map((education) => ({
      id: education.id,
      institutionName: education.institution_name,
      degreeType: education.degree_type ?? "",
      fieldOfStudy: education.field_of_study ?? "",
      location: education.location ?? "",
      startDate: education.start_date ?? "",
      endDate: education.end_date ?? "",
      isCurrent: education.is_current,
      gpa: education.gpa != null ? String(education.gpa) : "",
      achievements: education.achievements ?? [],
      relevantCoursework: education.relevant_coursework ?? [],
      displayOrder: education.display_order,
    })),
    skills: resume.skills.map((skill) => ({
      id: skill.id,
      skillName: skill.skill_name,
      skillCategory: skill.skill_category ?? "",
      proficiencyLevel: isSkillLevel(skill.proficiency_level)
        ? skill.proficiency_level
        : SKILL_LEVEL_FALLBACK,
      yearsOfExperience: skill.years_of_experience,
      isPrimary: skill.is_primary,
      displayOrder: skill.display_order,
    })),
    projects: resume.projects.map((project) => ({
      id: project.id,
      projectName: project.project_name,
      role: project.role ?? "",
      description: project.description ?? "",
      technologiesUsed: project.technologies_used ?? [],
      projectUrl: project.project_url ?? "",
      startDate: project.start_date ?? "",
      endDate: project.end_date ?? "",
      isCurrent: project.is_current,
      achievements: project.achievements ?? [],
      displayOrder: project.display_order,
    })),
    certifications: resume.certifications.map((certification) => ({
      id: certification.id,
      certificationName: certification.certification_name,
      issuingOrganization: certification.issuing_organization ?? "",
      issueDate: certification.issue_date ?? "",
      expiryDate: certification.expiry_date ?? "",
      credentialId: certification.credential_id ?? "",
      credentialUrl: certification.credential_url ?? "",
      displayOrder: certification.display_order,
    })),
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

function isSkillLevel(
  value: string | null
): value is ResumeBuilderData["skills"][number]["proficiencyLevel"] {
  return (
    value === "beginner" ||
    value === "intermediate" ||
    value === "advanced" ||
    value === "expert"
  );
}
