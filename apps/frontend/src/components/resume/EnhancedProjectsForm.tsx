"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, FolderKanban, ExternalLink } from "lucide-react";
import { useResumeBuilderStore, useProjects } from "@/stores/resume-builder-store";
import type { Project } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedProjectsFormProps {
  className?: string;
}

function ProjectCard({
  project,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="relative">
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FolderKanban className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {project.projectName || "New Project"}
              </span>
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            {project.role && (
              <p className="text-sm text-muted-foreground truncate">
                {project.role}
              </p>
            )}
            {project.technologiesUsed.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                {project.technologiesUsed.slice(0, 3).join(", ")}
                {project.technologiesUsed.length > 3 && "..."}
              </p>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onToggle} className="shrink-0">
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(project.id)}
            className="shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pl-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={project.projectName}
                  onChange={(e) => onUpdate(project.id, { projectName: e.target.value })}
                  placeholder="E-commerce Platform"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Role</Label>
                <Input
                  value={project.role}
                  onChange={(e) => onUpdate(project.id, { role: e.target.value })}
                  placeholder="Lead Developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project URL (optional)</Label>
              <Input
                type="url"
                value={project.projectUrl}
                onChange={(e) => onUpdate(project.id, { projectUrl: e.target.value })}
                placeholder="https://github.com/user/project"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={project.startDate}
                  onChange={(e) => onUpdate(project.id, { startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={project.endDate}
                  onChange={(e) => onUpdate(project.id, { endDate: e.target.value })}
                  disabled={project.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-project-${project.id}`}
                checked={project.isCurrent}
                onCheckedChange={(checked) =>
                  onUpdate(project.id, {
                    isCurrent: checked === true,
                    endDate: checked ? "" : project.endDate,
                  })
                }
              />
              <Label
                htmlFor={`current-project-${project.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                This is an ongoing project
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => onUpdate(project.id, { description: e.target.value })}
                placeholder="Describe the project, your contributions, and key outcomes..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Technologies Used</Label>
              <Input
                value={project.technologiesUsed.join(", ")}
                onChange={(e) =>
                  onUpdate(project.id, {
                    technologiesUsed: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="React, TypeScript, PostgreSQL"
              />
              <p className="text-xs text-muted-foreground">Comma-separated list</p>
            </div>

            <div className="space-y-2">
              <Label>Key Achievements (optional)</Label>
              <Textarea
                value={project.achievements.join("\n")}
                onChange={(e) =>
                  onUpdate(project.id, {
                    achievements: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="• Increased user engagement by 40%\n• Reduced load time by 60%"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">One achievement per line</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedProjectsForm({ className }: EnhancedProjectsFormProps) {
  const projects = useProjects();
  const addProject = useResumeBuilderStore((state) => state.addProject);
  const updateProject = useResumeBuilderStore((state) => state.updateProject);
  const removeProject = useResumeBuilderStore((state) => state.removeProject);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAddProject = () => {
    addProject();
    const newId = useResumeBuilderStore.getState().data.projects.at(-1)?.id;
    if (newId) {
      setExpandedIds((prev) => new Set([...prev, newId]));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Projects</h3>
          <p className="text-sm text-muted-foreground">
            Showcase your personal and professional projects
          </p>
        </div>
        <Button onClick={handleAddProject} size="sm">
          <Plus className="size-4 mr-1" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No projects added yet</p>
          <Button onClick={handleAddProject} variant="outline">
            <Plus className="size-4 mr-1" />
            Add your first project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isExpanded={expandedIds.has(project.id)}
                onToggle={() => toggleExpand(project.id)}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            ))}
        </div>
      )}
    </div>
  );
}
