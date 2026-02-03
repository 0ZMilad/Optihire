import type { ResumeData } from "./types";

interface ResumePreviewProps {
  resumeData: ResumeData;
  className?: string;
}

export default function ResumePreview({ resumeData, className }: ResumePreviewProps) {
  const { name, title, summary, experience, skills } = resumeData;
  
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">Live preview</p>
      <div className="mt-2 rounded-lg border p-4 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">{name || "Your Name"}</h2>
        <p className="text-muted-foreground">{title || "Role / Title"}</p>
        <hr className="my-3" />
        <p>{summary || "A concise professional summary."}</p>
        <h3 className="mt-4 font-medium">Experience</h3>
        <p className="whitespace-pre-wrap">{experience || "Describe your impact and outcomes."}</p>
        <h3 className="mt-4 font-medium">Skills</h3>
        <p>{skills || "List core skills"}</p>
      </div>
    </div>
  );
}
