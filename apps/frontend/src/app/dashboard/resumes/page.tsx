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
  User
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
import { toast } from "sonner";

function ResumeCard({ 
  resume, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: { 
  resume: SavedResume;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
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
  const getResume = useSavedResumesStore((state) => state.getResume);
  const loadFromData = useResumeBuilderStore((state) => state.loadFromData);

  const handleCreateNew = () => {
    setEditingResumeId(null);
    setShowBuilder(true);
  };

  const handleEdit = (id: string) => {
    const resume = getResume(id);
    if (resume) {
      // Convert ResumeRead to ResumeBuilderData format
      const builderData = {
        id: resume.id,
        versionName: resume.version_name,
        templateId: resume.template_id,
        isPrimary: resume.is_primary,
        personal: {
          fullName: resume.full_name || '',
          email: resume.email || '',
          phone: resume.phone || '',
          location: resume.location || '',
          linkedinUrl: resume.linkedin_url || '',
          githubUrl: resume.github_url || '',
          portfolioUrl: resume.portfolio_url || '',
        },
        summary: resume.professional_summary || '',
        experiences: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        sectionOrder: ['personal', 'summary', 'experiences', 'education', 'skills', 'projects', 'certifications'],
      };
      loadFromData(builderData);
      setEditingResumeId(id);
      setShowBuilder(true);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateResume(id);
    toast.success("Resume duplicated successfully!");
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
