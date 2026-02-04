"use client";

import { useResumeData } from "@/stores/resume-builder-store";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, FolderKanban } from "lucide-react";

interface EnhancedResumePreviewProps {
  className?: string;
}

export default function EnhancedResumePreview({ className }: EnhancedResumePreviewProps) {
  const resumeData = useResumeData();
  const { personal, summary, experiences, education, skills, projects, certifications } = resumeData;

  const hasContent = 
    personal.fullName || 
    summary || 
    experiences.length > 0 || 
    education.length > 0 || 
    skills.length > 0 ||
    projects.length > 0 ||
    certifications.length > 0;

  return (
    <div className={cn("", className)}>
      <p className="text-sm text-muted-foreground mb-2">Live Preview</p>
      
      <div className="rounded-lg border bg-white dark:bg-gray-950 p-4 text-sm leading-relaxed max-h-[600px] overflow-y-auto">
        {!hasContent ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Start filling in your details to see the preview</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <header>
              <h2 className="text-lg font-semibold">
                {personal.fullName || "Your Name"}
              </h2>
              
              {/* Contact info */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                {personal.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3" />
                    {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" />
                    {personal.phone}
                  </span>
                )}
                {personal.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {personal.location}
                  </span>
                )}
              </div>
              
              {/* Links */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                {personal.linkedinUrl && (
                  <span className="inline-flex items-center gap-1">
                    <Linkedin className="size-3" />
                    LinkedIn
                  </span>
                )}
                {personal.githubUrl && (
                  <span className="inline-flex items-center gap-1">
                    <Github className="size-3" />
                    GitHub
                  </span>
                )}
                {personal.portfolioUrl && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3" />
                    Portfolio
                  </span>
                )}
              </div>
            </header>

            <hr className="border-gray-200 dark:border-gray-800" />

            {/* Summary */}
            {summary && (
              <section>
                <p className="text-xs">{summary}</p>
              </section>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <section>
                <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Briefcase className="size-3" />
                  Experience
                </h3>
                <div className="space-y-2">
                  {experiences.slice(0, 3).map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="font-medium">
                        {exp.jobTitle || "Position"} 
                        {exp.companyName && <span className="font-normal"> at {exp.companyName}</span>}
                      </div>
                      <div className="text-muted-foreground">
                        {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                      </div>
                    </div>
                  ))}
                  {experiences.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{experiences.length - 3} more...
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <GraduationCap className="size-3" />
                  Education
                </h3>
                <div className="space-y-2">
                  {education.slice(0, 2).map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="font-medium">
                        {edu.degreeType} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                      </div>
                      <div className="text-muted-foreground">
                        {edu.institutionName}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      {skill.skillName}
                    </span>
                  ))}
                  {skills.length > 8 && (
                    <span className="text-xs text-muted-foreground">
                      +{skills.length - 8}
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <FolderKanban className="size-3" />
                  Projects
                </h3>
                <div className="space-y-1">
                  {projects.slice(0, 2).map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <span className="font-medium">{proj.projectName}</span>
                      {proj.role && <span className="text-muted-foreground"> — {proj.role}</span>}
                    </div>
                  ))}
                  {projects.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{projects.length - 2} more...
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                  <Award className="size-3" />
                  Certifications
                </h3>
                <div className="space-y-1">
                  {certifications.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="text-xs">
                      <span className="font-medium">{cert.certificationName}</span>
                      {cert.issuingOrganization && (
                        <span className="text-muted-foreground"> — {cert.issuingOrganization}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
