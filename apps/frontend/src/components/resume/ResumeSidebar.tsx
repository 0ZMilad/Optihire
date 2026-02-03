import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResumePreview from "./ResumePreview";
import ResumeExport from "./ResumeExport";
import type { ResumeData } from "./types";

interface ResumeSidebarProps {
  resumeData: ResumeData;
  className?: string;
}

export default function ResumeSidebar({ resumeData, className }: ResumeSidebarProps) {
  return (
    <aside className={cn("border rounded-xl p-4 bg-card", className)}>
      <Button className="w-full">
        Analyze your resume against a job
      </Button>

      <ResumeExport resumeData={resumeData} className="mt-3" />
      
      <ResumePreview resumeData={resumeData} className="mt-6" />
    </aside>
  );
}
