"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderKanban,
  Award,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

// Store and hooks
import { useResumeBuilderStore } from "@/stores/resume-builder-store";
import { useAutoSave, useDraftRecovery, useBeforeUnload } from "@/hooks/use-resume-builder";

// Form components
import EnhancedProfileForm from "./EnhancedProfileForm";
import EnhancedExperienceForm from "./EnhancedExperienceForm";
import EnhancedEducationForm from "./EnhancedEducationForm";
import EnhancedSkillsForm from "./EnhancedSkillsForm";
import EnhancedProjectsForm from "./EnhancedProjectsForm";
import EnhancedCertificationsForm from "./EnhancedCertificationsForm";

// UI components
import SaveStatusIndicator from "./SaveStatusIndicator";
import DraftRecoveryDialog from "./DraftRecoveryDialog";
import EnhancedResumeSidebar from "./EnhancedResumeSidebar";
import EnhancedResumePreview from "./EnhancedResumePreview";

interface EnhancedResumeBuilderUIProps {
  className?: string;
  onBack?: () => void;
  resumeId?: string; // For loading existing resume
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "preview", label: "Preview", icon: Eye },
] as const;

export default function EnhancedResumeBuilderUI({ 
  className, 
  onBack,
  resumeId,
}: EnhancedResumeBuilderUIProps) {
  // Store state
  const activeSection = useResumeBuilderStore((state) => state.activeSection);
  const setActiveSection = useResumeBuilderStore((state) => state.setActiveSection);
  const initialize = useResumeBuilderStore((state) => state.initialize);
  const isInitialized = useResumeBuilderStore((state) => state.isInitialized);
  
  // Draft recovery
  const { 
    hasDraft, 
    lastSaved, 
    recoverDraft, 
    discardDraft,
  } = useDraftRecovery({ autoLoad: false });
  
  // Show draft recovery dialog
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Setup auto-save
  useAutoSave({ debounceMs: 2000 });
  
  // Setup before unload warning
  useBeforeUnload();

  // Initialize store
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Check for draft after initialization
  useEffect(() => {
    if (isInitialized && hasDraft && !resumeId) {
      setShowDraftDialog(true);
    }
  }, [isInitialized, hasDraft, resumeId]);

  // Handle draft recovery
  const handleRecoverDraft = useCallback(() => {
    recoverDraft();
    setShowDraftDialog(false);
  }, [recoverDraft]);

  const handleDiscardDraft = useCallback(() => {
    discardDraft();
    setShowDraftDialog(false);
  }, [discardDraft]);

  return (
    <div className={cn("mx-auto max-w-7xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">
              Build your professional resume with live preview
            </p>
          </div>
        </div>
        
        <SaveStatusIndicator />
      </div>

      {/* Main content */}
      <div className="grid gap-6 grid-cols-1">
        {/* Editor */}
        <div>
          <Tabs 
            value={activeSection} 
            onValueChange={setActiveSection}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7 h-auto p-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 py-2 text-xs sm:text-sm"
                >
                  <tab.icon className="size-4 hidden sm:block" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 rounded-lg border bg-card p-6">
              <TabsContent value="profile" className="mt-0">
                <EnhancedProfileForm />
              </TabsContent>

              <TabsContent value="experience" className="mt-0">
                <EnhancedExperienceForm />
              </TabsContent>

              <TabsContent value="education" className="mt-0">
                <EnhancedEducationForm />
              </TabsContent>

              <TabsContent value="skills" className="mt-0">
                <EnhancedSkillsForm />
              </TabsContent>

              <TabsContent value="projects" className="mt-0">
                <EnhancedProjectsForm />
              </TabsContent>

              <TabsContent value="certifications" className="mt-0">
                <EnhancedCertificationsForm />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                {/* Gray background for document metaphor */}
                <div className="min-h-screen bg-gray-100 -mx-6 px-6 py-6">
                  {/* Header Bar with Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ● Saved
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {/* Primary Action */}
                        <EnhancedResumeSidebar layout="full" className="" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Preview */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-[8.5in] bg-white shadow-lg rounded-lg overflow-hidden" style={{aspectRatio: '8.5/11'}}>
                      <div className="p-8 h-full">
                        <EnhancedResumePreview hideLabel={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Draft recovery dialog */}
      <DraftRecoveryDialog
        open={showDraftDialog}
        onRecover={handleRecoverDraft}
        onDiscard={handleDiscardDraft}
        lastSaved={lastSaved}
      />
    </div>
  );
}
