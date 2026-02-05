"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderKanban,
  Award,
  Eye,
  Save,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Store and hooks
import { useResumeBuilderStore, useResumeData } from "@/stores/resume-builder-store";
import { useSavedResumesStore } from "@/stores/saved-resumes-store";
import { useBeforeUnload } from "@/hooks/use-resume-builder";

// Form components
import EnhancedProfileForm from "./EnhancedProfileForm";
import EnhancedExperienceForm from "./EnhancedExperienceForm";
import EnhancedEducationForm from "./EnhancedEducationForm";
import EnhancedSkillsForm from "./EnhancedSkillsForm";
import EnhancedProjectsForm from "./EnhancedProjectsForm";
import EnhancedCertificationsForm from "./EnhancedCertificationsForm";

// UI components
import EnhancedResumeSidebar from "./EnhancedResumeSidebar";
import EnhancedResumePreview from "./EnhancedResumePreview";

interface EnhancedResumeBuilderUIProps {
  className?: string;
  onBack?: () => void;
  onSave?: (resumeId: string) => void;
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
  onSave,
  resumeId,
}: EnhancedResumeBuilderUIProps) {
  // Store state
  const activeSection = useResumeBuilderStore((state) => state.activeSection);
  const setActiveSection = useResumeBuilderStore((state) => state.setActiveSection);
  const initialize = useResumeBuilderStore((state) => state.initialize);
  const isInitialized = useResumeBuilderStore((state) => state.isInitialized);
  const reset = useResumeBuilderStore((state) => state.reset);
  const resumeData = useResumeData();
  
  // Saved resumes store
  const saveResume = useSavedResumesStore((state) => state.saveResume);
  const updateResume = useSavedResumesStore((state) => state.updateResume);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const resumeTitleRef = useRef("");
  
  // Debug: Track resumeTitle changes
  useEffect(() => {
    console.log("resumeTitle state changed to:", resumeTitle);
    resumeTitleRef.current = resumeTitle;
  }, [resumeTitle]);
  
  // Setup before unload warning
  useBeforeUnload();

  // Initialize store
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  // Always start with profile section when opening resume builder
  useEffect(() => {
    if (isInitialized) {
      setActiveSection("profile");
    }
  }, [isInitialized, setActiveSection]);
  
  // Initialize resume title when editing existing resume
  useEffect(() => {
    if (resumeId && isInitialized) {
      // Get the resume from the store using the hook instead of getState()
      const getResume = useSavedResumesStore.getState().getResume;
      const existingResume = getResume(resumeId);
      if (existingResume) {
        console.log("Loading existing resume:", existingResume.name); // Debug log
        setResumeTitle(existingResume.name);
        resumeTitleRef.current = existingResume.name;
      }
    } else if (!resumeId && isInitialized) {
      // Clear title when creating new resume
      setResumeTitle("");
      resumeTitleRef.current = "";
    }
  }, [resumeId, isInitialized]); // Include isInitialized to ensure proper timing

  // Handle save resume
  const handleSaveResume = useCallback(() => {
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!resumeData.personal.fullName.trim()) {
        toast.error("Please enter your full name before saving");
        setActiveSection("profile");
        setIsSaving(false);
        return;
      }
      
      if (!resumeData.personal.email.trim()) {
        toast.error("Please enter your email before saving");
        setActiveSection("profile");
        setIsSaving(false);
        return;
      }

      let savedId: string;
      const finalTitle = resumeTitle.trim() || undefined;
      console.log("Saving with title:", finalTitle, "from state:", resumeTitle); // Debug log
      
      if (resumeId) {
        // Update existing resume
        console.log("Updating existing resume with id:", resumeId); // Debug log
        updateResume(resumeId, resumeData, finalTitle);
        savedId = resumeId;
        toast.success("Resume updated successfully!");
      } else {
        // Save new resume
        console.log("Saving new resume"); // Debug log
        savedId = saveResume(resumeData, finalTitle);
        toast.success("Resume saved successfully!");
      }
      
      // Callback to parent first
      if (onSave) {
        onSave(savedId);
      } else if (onBack) {
        onBack();
      }
      
      // Reset the builder after navigation
      reset();
    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, resumeId, resumeTitle, saveResume, updateResume, reset, onSave, onBack, setActiveSection]);

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
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Untitled Resume"
              value={resumeTitle}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log("Input changed:", newValue); // Debug log
                setResumeTitle(newValue);
                resumeTitleRef.current = newValue; // Keep ref in sync
              }}
              className="text-lg font-semibold border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Build your professional resume with live preview
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleSaveResume} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Resume
              </>
            )}
          </Button>
        </div>
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
    </div>
  );
}
