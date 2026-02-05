"use client";

import { cn } from "@/lib/utils";
import { useResumeData } from "@/stores/resume-builder-store";
import EnhancedResumePreview from "./EnhancedResumePreview";

interface EnhancedResumeSidebarProps {
  className?: string;
  layout?: 'sidebar' | 'full'; // Add layout prop to control appearance
}

export default function EnhancedResumeSidebar({ 
  className, 
  layout = 'sidebar' 
}: EnhancedResumeSidebarProps) {
  const resumeData = useResumeData();

  return (
    <aside className={cn(
      "border rounded-xl p-4 bg-card", 
      layout === 'full' ? 'border-0 p-0 bg-transparent' : '',
      className
    )}>
      {/* Preview - only show in sidebar mode */}
      {layout === 'sidebar' && (
        <div className="mt-6">
          <EnhancedResumePreview />
        </div>
      )}
    </aside>
  );
}
