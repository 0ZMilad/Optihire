"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useResumeBuilderStore, useExperiences } from "@/stores/resume-builder-store";
import type { WorkExperience } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedExperienceFormProps {
  className?: string;
}

function ExperienceCard({ 
  experience, 
  isExpanded,
  onToggle,
  onUpdate, 
  onRemove 
}: {
  experience: WorkExperience;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="relative">
      <CardContent className="pt-4">
        {/* Header - always visible */}
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
              <span className="font-medium truncate">
                {experience.jobTitle || "New Position"}
              </span>
              {experience.companyName && (
                <span className="text-muted-foreground truncate">
                  at {experience.companyName}
                </span>
              )}
            </div>
            {(experience.startDate || experience.isCurrent) && (
              <p className="text-xs text-muted-foreground">
                {experience.startDate} — {experience.isCurrent ? "Present" : experience.endDate}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(experience.id)}
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
                <Label>Job Title</Label>
                <Input
                  value={experience.jobTitle}
                  onChange={(e) => onUpdate(experience.id, { jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={experience.companyName}
                  onChange={(e) => onUpdate(experience.id, { companyName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={experience.location}
                onChange={(e) => onUpdate(experience.id, { location: e.target.value })}
                placeholder="San Francisco, CA (or Remote)"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => onUpdate(experience.id, { startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => onUpdate(experience.id, { endDate: e.target.value })}
                  disabled={experience.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-${experience.id}`}
                checked={experience.isCurrent}
                onCheckedChange={(checked) => 
                  onUpdate(experience.id, { 
                    isCurrent: checked === true,
                    endDate: checked ? "" : experience.endDate
                  })
                }
              />
              <Label 
                htmlFor={`current-${experience.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                I currently work here
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Description & Achievements</Label>
              <Textarea
                value={experience.description}
                onChange={(e) => onUpdate(experience.id, { description: e.target.value })}
                placeholder="• Led development of...\n• Improved performance by...\n• Collaborated with..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Use bullet points to highlight key achievements and impact
              </p>
            </div>

            <div className="space-y-2">
              <Label>Skills Used</Label>
              <Input
                value={experience.skillsUsed.join(", ")}
                onChange={(e) => 
                  onUpdate(experience.id, { 
                    skillsUsed: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })
                }
                placeholder="React, TypeScript, Node.js"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of technologies and skills
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedExperienceForm({ className }: EnhancedExperienceFormProps) {
  const experiences = useExperiences();
  const addExperience = useResumeBuilderStore((state) => state.addExperience);
  const updateExperience = useResumeBuilderStore((state) => state.updateExperience);
  const removeExperience = useResumeBuilderStore((state) => state.removeExperience);
  
  // Track which cards are expanded (new items auto-expand)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAddExperience = () => {
    addExperience();
    // Get the new experience ID (it's the last one added)
    const newId = useResumeBuilderStore.getState().data.experiences.at(-1)?.id;
    if (newId) {
      setExpandedIds(prev => new Set([...prev, newId]));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
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
          <h3 className="font-medium">Work Experience</h3>
          <p className="text-sm text-muted-foreground">
            Add your professional experience, most recent first
          </p>
        </div>
        <Button onClick={handleAddExperience} size="sm">
          <Plus className="size-4 mr-1" />
          Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No experience added yet
          </p>
          <Button onClick={handleAddExperience} variant="outline">
            <Plus className="size-4 mr-1" />
            Add your first experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                isExpanded={expandedIds.has(experience.id)}
                onToggle={() => toggleExpand(experience.id)}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            ))}
        </div>
      )}
    </div>
  );
}
