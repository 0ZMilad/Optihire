"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, FileDown, Sparkles } from "lucide-react";
import { useResumeData } from "@/stores/resume-builder-store";
import EnhancedResumePreview from "./EnhancedResumePreview";

interface EnhancedResumeSidebarProps {
  className?: string;
}

export default function EnhancedResumeSidebar({ className }: EnhancedResumeSidebarProps) {
  const resumeData = useResumeData();

  // Build export HTML from the enhanced data structure
  const buildExportHTML = () => {
    const safe = (v: string) => (v || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const { personal, summary, experiences, education, skills, projects, certifications } = resumeData;

    const experienceHTML = experiences.length > 0 
      ? experiences.map(exp => `
        <div class="experience-item">
          <div class="job-header">
            <strong>${safe(exp.jobTitle)}</strong> at ${safe(exp.companyName)}
          </div>
          <div class="job-meta">${safe(exp.location)} | ${safe(exp.startDate)} - ${exp.isCurrent ? 'Present' : safe(exp.endDate)}</div>
          <p>${safe(exp.description)}</p>
          ${exp.skillsUsed.length > 0 ? `<div class="skills-used">Skills: ${exp.skillsUsed.map(s => safe(s)).join(', ')}</div>` : ''}
        </div>
      `).join('')
      : '<p>No experience listed</p>';

    const educationHTML = education.length > 0
      ? education.map(edu => `
        <div class="education-item">
          <strong>${safe(edu.degreeType)} in ${safe(edu.fieldOfStudy)}</strong>
          <div>${safe(edu.institutionName)}</div>
          <div class="edu-meta">${safe(edu.startDate)} - ${edu.isCurrent ? 'Present' : safe(edu.endDate)}</div>
        </div>
      `).join('')
      : '';

    const skillsHTML = skills.length > 0
      ? skills.map(s => safe(s.skillName)).join(', ')
      : 'No skills listed';

    const projectsHTML = projects.length > 0
      ? projects.map(proj => `
        <div class="project-item">
          <strong>${safe(proj.projectName)}</strong>
          ${proj.role ? `<span class="role"> - ${safe(proj.role)}</span>` : ''}
          <p>${safe(proj.description)}</p>
          ${proj.technologiesUsed.length > 0 ? `<div class="tech-used">${proj.technologiesUsed.map(t => safe(t)).join(', ')}</div>` : ''}
        </div>
      `).join('')
      : '';

    const certificationsHTML = certifications.length > 0
      ? certifications.map(cert => `
        <div class="cert-item">
          <strong>${safe(cert.certificationName)}</strong>
          <div>${safe(cert.issuingOrganization)} | ${safe(cert.issueDate)}</div>
        </div>
      `).join('')
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safe(personal.fullName || "Resume")}</title>
  <style>
    :root { --text: #111; }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; color: var(--text); margin: 0; padding: 32px; }
    .resume { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 28px; margin: 0 0 4px; }
    .contact { color: #666; margin: 0 0 16px; font-size: 14px; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }
    h2 { font-size: 16px; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: .04em; color: #333; }
    p { line-height: 1.6; white-space: pre-wrap; margin: 8px 0; }
    .experience-item, .education-item, .project-item, .cert-item { margin-bottom: 16px; }
    .job-header { font-size: 15px; }
    .job-meta, .edu-meta { font-size: 13px; color: #666; margin: 2px 0; }
    .skills-used, .tech-used { font-size: 13px; color: #666; margin-top: 4px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <main class="resume">
    <h1>${safe(personal.fullName) || "Your Name"}</h1>
    <p class="contact">
      ${[personal.email, personal.phone, personal.location].filter(Boolean).map(safe).join(' | ')}
      ${personal.linkedinUrl ? `<br><a href="${safe(personal.linkedinUrl)}">LinkedIn</a>` : ''}
      ${personal.githubUrl ? ` | <a href="${safe(personal.githubUrl)}">GitHub</a>` : ''}
      ${personal.portfolioUrl ? ` | <a href="${safe(personal.portfolioUrl)}">Portfolio</a>` : ''}
    </p>
    <hr />
    
    ${summary ? `
    <section>
      <h2>Summary</h2>
      <p>${safe(summary)}</p>
    </section>
    ` : ''}
    
    ${experiences.length > 0 ? `
    <section>
      <h2>Experience</h2>
      ${experienceHTML}
    </section>
    ` : ''}
    
    ${education.length > 0 ? `
    <section>
      <h2>Education</h2>
      ${educationHTML}
    </section>
    ` : ''}
    
    ${skills.length > 0 ? `
    <section>
      <h2>Skills</h2>
      <p>${skillsHTML}</p>
    </section>
    ` : ''}
    
    ${projects.length > 0 ? `
    <section>
      <h2>Projects</h2>
      ${projectsHTML}
    </section>
    ` : ''}
    
    ${certifications.length > 0 ? `
    <section>
      <h2>Certifications</h2>
      ${certificationsHTML}
    </section>
    ` : ''}
  </main>
</body>
</html>`;
  };

  const downloadPDF = () => {
    const html = buildExportHTML();
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const downloadHTML = () => {
    const html = buildExportHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.personal.fullName || "resume"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className={cn("border rounded-xl p-4 bg-card", className)}>
      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full" variant="default">
          <Sparkles className="mr-2 size-4" />
          Analyze Resume
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            <FileText className="mr-1 size-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHTML}>
            <FileDown className="mr-1 size-4" />
            HTML
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6">
        <EnhancedResumePreview />
      </div>
    </aside>
  );
}
