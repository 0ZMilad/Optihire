"use client";

import { useMemo, memo } from "react";
import { useResumeData } from "@/stores/resume-builder-store";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, FolderKanban } from "lucide-react";

interface EnhancedResumePreviewProps {
  className?: string;
  hideLabel?: boolean; // For full preview mode
}

export default memo(function EnhancedResumePreview({ className, hideLabel = false }: EnhancedResumePreviewProps) {
  const resumeData = useResumeData();
  const { personal, summary, experiences, education, skills, projects, certifications } = resumeData;

  const hasContent = useMemo(() => 
    personal.fullName || 
    summary || 
    experiences.length > 0 || 
    education.length > 0 || 
    skills.length > 0 ||
    projects.length > 0 ||
    certifications.length > 0,
    [personal.fullName, summary, experiences.length, education.length, skills.length, projects.length, certifications.length]
  );

  // Empty state with proper placeholder
  if (!hasContent) {
    return (
      <div className={cn("", className)}>
        {!hideLabel && (
          <p className="text-sm text-muted-foreground mb-2">Live Preview</p>
        )}
        
        <div className={cn(
          "rounded-lg bg-white text-sm leading-relaxed",
          hideLabel ? "h-full" : "border max-h-[600px] overflow-y-auto p-4"
        )}>
          <div className="text-center text-muted-foreground py-12">
            <div className="space-y-4">
              {/* Skeleton placeholder */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-32 mx-auto"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </div>
              <p className="text-sm font-medium">Start filling in your details to see the preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {!hideLabel && (
        <p className="text-sm text-muted-foreground mb-2">Live Preview</p>
      )}
      
      <div className={cn(
        "bg-white leading-relaxed font-serif",
        hideLabel ? "h-full text-base" : "rounded-lg border max-h-[600px] overflow-y-auto p-4 text-sm"
      )}>
        <div className="space-y-6">
          {/* Header */}
          <header>
            <h1 className={cn(
              "font-bold text-gray-900",
              hideLabel ? "text-2xl" : "text-lg"
            )}>
              {personal.fullName || "Your Name"}
            </h1>
            
            {/* Contact info */}
            <div className={cn(
              "flex flex-wrap gap-x-4 gap-y-1 text-gray-600 mt-2",
              hideLabel ? "text-sm" : "text-xs"
            )}>
              {personal.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className={cn("size-3", hideLabel && "size-4")} />
                  {personal.email}
                </span>
              )}
              {personal.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className={cn("size-3", hideLabel && "size-4")} />
                  {personal.phone}
                </span>
              )}
              {personal.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className={cn("size-3", hideLabel && "size-4")} />
                  {personal.location}
                </span>
              )}
            </div>
            
            {/* Links */}
            <div className={cn(
              "flex flex-wrap gap-x-4 gap-y-1 text-gray-600 mt-1",
              hideLabel ? "text-sm" : "text-xs"
            )}>
              {personal.linkedinUrl && (
                <span className="inline-flex items-center gap-1.5">
                  <Linkedin className={cn("size-3", hideLabel && "size-4")} />
                  LinkedIn
                </span>
              )}
              {personal.githubUrl && (
                <span className="inline-flex items-center gap-1.5">
                  <Github className={cn("size-3", hideLabel && "size-4")} />
                  GitHub
                </span>
              )}
              {personal.portfolioUrl && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className={cn("size-3", hideLabel && "size-4")} />
                  Portfolio
                </span>
              )}
            </div>
          </header>

          <hr className="border-gray-200" />

          {/* Summary */}
          {summary && (
            <section>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                hideLabel ? "text-base" : "text-xs"
              )}>{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 className={cn(
                "font-semibold uppercase tracking-wide text-gray-800 mb-3 flex items-center gap-2",
                hideLabel ? "text-sm border-b border-gray-200 pb-1" : "text-xs"
              )}>
                <Briefcase className={cn("size-3", hideLabel && "size-4")} />
                Experience
              </h2>
              <div className="space-y-4">
                {experiences.slice(0, hideLabel ? 10 : 3).map((exp) => (
                  <div key={exp.id} className={cn(hideLabel ? "text-sm" : "text-xs")}>
                    <div className="font-semibold text-gray-900">
                      {exp.jobTitle || "Position"} 
                      {exp.companyName && <span className="font-normal text-gray-700"> at {exp.companyName}</span>}
                    </div>
                    <div className={cn(
                      "text-gray-600 mt-0.5",
                      hideLabel ? "text-sm" : "text-xs"
                    )}>
                      {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                      {exp.location && ` • ${exp.location}`}
                    </div>
                    {exp.description && hideLabel && (
                      <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
                {experiences.length > 3 && !hideLabel && (
                  <p className="text-xs text-gray-500">
                    +{experiences.length - 3} more...
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className={cn(
                "font-semibold uppercase tracking-wide text-gray-800 mb-3 flex items-center gap-2",
                hideLabel ? "text-sm border-b border-gray-200 pb-1" : "text-xs"
              )}>
                <GraduationCap className={cn("size-3", hideLabel && "size-4")} />
                Education
              </h2>
              <div className="space-y-3">
                {education.slice(0, hideLabel ? 10 : 2).map((edu) => (
                  <div key={edu.id} className={cn(hideLabel ? "text-sm" : "text-xs")}>
                    <div className="font-semibold text-gray-900">
                      {edu.degreeType} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </div>
                    <div className="text-gray-600">
                      {edu.institutionName}
                    </div>
                    {(edu.startDate || edu.endDate) && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        {edu.startDate} — {edu.isCurrent ? "Present" : edu.endDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className={cn(
                "font-semibold uppercase tracking-wide text-gray-800 mb-3 flex items-center gap-2",
                hideLabel ? "text-sm border-b border-gray-200 pb-1" : "text-xs"
              )}>
                Skills
              </h2>
              <div className={cn(
                "flex flex-wrap gap-2",
                hideLabel ? "gap-3" : ""
              )}>
                {skills.slice(0, hideLabel ? 20 : 8).map((skill) => (
                  <span
                    key={skill.id}
                    className={cn(
                      "bg-gray-200 text-gray-800 rounded px-2.5 py-1",
                      hideLabel ? "text-sm py-1.5" : "text-xs"
                    )}
                  >
                    {skill.skillName}
                  </span>
                ))}
                {skills.length > 8 && !hideLabel && (
                  <span className="text-xs text-gray-500">
                    +{skills.length - 8}
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className={cn(
                "font-semibold uppercase tracking-wide text-gray-800 mb-3 flex items-center gap-2",
                hideLabel ? "text-sm border-b border-gray-200 pb-1" : "text-xs"
              )}>
                <FolderKanban className={cn("size-3", hideLabel && "size-4")} />
                Projects
              </h2>
              <div className="space-y-3">
                {projects.slice(0, hideLabel ? 10 : 2).map((proj) => (
                  <div key={proj.id} className={cn(hideLabel ? "text-sm" : "text-xs")}>
                    <div className="font-semibold text-gray-900">{proj.projectName}</div>
                    {proj.role && <div className="text-gray-600">{proj.role}</div>}
                    {proj.description && hideLabel && (
                      <p className="text-gray-700 mt-1 leading-relaxed">{proj.description}</p>
                    )}
                  </div>
                ))}
                {projects.length > 2 && !hideLabel && (
                  <p className="text-xs text-gray-500">
                    +{projects.length - 2} more...
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section>
              <h2 className={cn(
                "font-semibold uppercase tracking-wide text-gray-800 mb-3 flex items-center gap-2",
                hideLabel ? "text-sm border-b border-gray-200 pb-1" : "text-xs"
              )}>
                <Award className={cn("size-3", hideLabel && "size-4")} />
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.slice(0, hideLabel ? 10 : 3).map((cert) => (
                  <div key={cert.id} className={cn(hideLabel ? "text-sm" : "text-xs")}>
                    <div className="font-semibold text-gray-900">{cert.certificationName}</div>
                    {cert.issuingOrganization && (
                      <div className="text-gray-600">{cert.issuingOrganization}</div>
                    )}
                    {cert.issueDate && (
                      <div className="text-gray-500 text-xs mt-0.5">{cert.issueDate}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
});
