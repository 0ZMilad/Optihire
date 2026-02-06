"use client";

import { useState } from "react";
import { Main } from "@/components/main";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Copy, 
  Trash2,
  Calendar,
  User,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EnhancedResumeBuilderUI } from "@/components/resume";
import { useSavedResumesStore, useSavedResumes, type SavedResume } from "@/stores/saved-resumes-store";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";
import { downloadResumePdf, getResumeCompleteData } from "@/middle-service/resumes";
import { toast } from "sonner";

function ResumeCard({ 
  resume, 
  onEdit, 
  onDuplicate,
  onDownload, 
  onDelete 
}: { 
  resume: SavedResume;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{resume.version_name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="size-3" />
                  {resume.full_name || "No name"}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDuplicate(resume.id)}>
                  <Copy className="mr-2 size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(resume.id)}>
                  <Download className="mr-2 size-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-sm text-muted-foreground space-y-1">
            {resume.email && (
              <p className="truncate">{resume.email}</p>
            )}
            <p className="flex items-center gap-1">
              <span>Status: {resume.processing_status}</span>
              {resume.professional_summary && (
                <>
                  <span>•</span>
                  <span>Summary available</span>
                </>
              )}
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Updated {formatDate(resume.updated_at)}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onEdit(resume.id)}>
              Edit
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resume.version_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(resume.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ResumesPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  
  const { resumes, isLoading } = useSavedResumes();
  const deleteResume = useSavedResumesStore((state) => state.deleteResume);
  const duplicateResume = useSavedResumesStore((state) => state.duplicateResume);
  const loadFromData = useResumeBuilderStore((state) => state.loadFromData);

  const handleCreateNew = () => {
    setEditingResumeId(null);
    setShowBuilder(true);
  };

  const handleEdit = async (id: string) => {
    try {
      // Fetch full resume with all sections from the API
      const complete = await getResumeCompleteData(id);
      
      const builderData = {
        id: complete.id,
        versionName: complete.version_name,
        templateId: complete.template_id,
        isPrimary: complete.is_primary,
        personal: {
          fullName: complete.full_name || '',
          email: complete.email || '',
          phone: complete.phone || '',
          location: complete.location || '',
          linkedinUrl: complete.linkedin_url || '',
          githubUrl: complete.github_url || '',
          portfolioUrl: complete.portfolio_url || '',
        },
        summary: complete.professional_summary || '',
        experiences: (complete.experiences || []).map((exp) => ({
          id: exp.id,
          companyName: exp.company_name,
          jobTitle: exp.job_title,
          location: exp.location || '',
          startDate: exp.start_date || '',
          endDate: exp.end_date || '',
          isCurrent: exp.is_current,
          description: exp.description || '',
          achievements: exp.achievements || [],
          skillsUsed: exp.skills_used || [],
          displayOrder: exp.display_order,
        })),
        education: (complete.education || []).map((edu) => ({
          id: edu.id,
          institutionName: edu.institution_name,
          degreeType: edu.degree_type || '',
          fieldOfStudy: edu.field_of_study || '',
          location: edu.location || '',
          startDate: edu.start_date || '',
          endDate: edu.end_date || '',
          isCurrent: edu.is_current,
          gpa: edu.gpa != null ? String(edu.gpa) : '',
          achievements: edu.achievements || [],
          relevantCoursework: edu.relevant_coursework || [],
          displayOrder: edu.display_order,
        })),
        skills: (complete.skills || []).map((s) => ({
          id: s.id,
          skillName: s.skill_name,
          skillCategory: s.skill_category || '',
          proficiencyLevel: (s.proficiency_level || 'intermediate') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
          yearsOfExperience: s.years_of_experience,
          isPrimary: s.is_primary,
          displayOrder: s.display_order,
        })),
        projects: (complete.projects || []).map((p) => ({
          id: p.id,
          projectName: p.project_name,
          role: p.role || '',
          description: p.description || '',
          technologiesUsed: p.technologies_used || [],
          projectUrl: p.project_url || '',
          startDate: p.start_date || '',
          endDate: p.end_date || '',
          isCurrent: p.is_current,
          achievements: p.achievements || [],
          displayOrder: p.display_order,
        })),
        certifications: (complete.certifications || []).map((c) => ({
          id: c.id,
          certificationName: c.certification_name,
          issuingOrganization: c.issuing_organization || '',
          issueDate: c.issue_date || '',
          expiryDate: c.expiry_date || '',
          credentialId: c.credential_id || '',
          credentialUrl: c.credential_url || '',
          displayOrder: c.display_order,
        })),
        sectionOrder: ['personal', 'summary', 'experiences', 'education', 'skills', 'projects', 'certifications'],
      };
      loadFromData(builderData);
      setEditingResumeId(id);
      setShowBuilder(true);
    } catch (error: any) {
      console.error('Failed to load resume for editing:', error);
      toast.error('Failed to load resume data. Please try again.');
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateResume(id);
    toast.success("Resume duplicated successfully!");
  };

  const handleDownload = async (id: string) => {
    try {
      await downloadResumePdf(id);
      toast.success("Resume downloaded successfully!");
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error(error.message || "Failed to download resume");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResume(id);
      toast.success("Resume deleted successfully");
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || "Failed to delete resume");
    }
  };

  const handleSaveComplete = () => {
    // Force refresh resume list from backend to reflect the new save
    useSavedResumesStore.getState().refreshResumes();
    setShowBuilder(false);
    setEditingResumeId(null);
  };

  const handleBack = () => {
    setShowBuilder(false);
    setEditingResumeId(null);
  };

  return (
    <DashboardLayout>
      <Main>
        <div className="mx-auto max-w-7xl space-y-8 px-4">
          {showBuilder ? (
            <EnhancedResumeBuilderUI 
              onBack={handleBack} 
              onSave={handleSaveComplete}
              resumeId={editingResumeId || undefined}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">My Resumes</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage and organize your resumes 
                    {isLoading && " • Syncing..."}
                  </p>
                </div>
                {resumes.length > 0 && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 size-4" />
                    Create Resume
                  </Button>
                )}
              </div>

              {/* Resumes Grid */}
              {resumes.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
                  <h2 className="text-lg font-semibold mb-2">No resumes yet</h2>
                  <p className="text-muted-foreground mb-6">Create your first resume to get started</p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 size-4" />
                    Create Resume
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {resumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Main>
    </DashboardLayout>
  );
}
