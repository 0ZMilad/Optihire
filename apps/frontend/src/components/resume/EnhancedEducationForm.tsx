"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { useResumeBuilderStore, useEducation } from "@/stores/resume-builder-store";
import type { Education } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedEducationFormProps {
  className?: string;
}

function EducationCard({
  education,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  education: Education;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Education>) => void;
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
              <GraduationCap className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {education.degreeType && education.fieldOfStudy
                  ? `${education.degreeType} in ${education.fieldOfStudy}`
                  : education.degreeType || education.fieldOfStudy || "New Education"}
              </span>
            </div>
            {education.institutionName && (
              <p className="text-sm text-muted-foreground truncate">
                {education.institutionName}
              </p>
            )}
            {(education.startDate || education.isCurrent) && (
              <p className="text-xs text-muted-foreground">
                {education.startDate} — {education.isCurrent ? "Present" : education.endDate}
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
            onClick={() => onRemove(education.id)}
            className="shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pl-6">
            <div className="space-y-2">
              <Label>
                Institution Name <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                minLength={2}
                maxLength={150}
                value={education.institutionName}
                onChange={(e) => onUpdate(education.id, { institutionName: e.target.value })}
                placeholder="Stanford University"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Degree Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  minLength={2}
                  maxLength={100}
                  value={education.degreeType}
                  onChange={(e) => onUpdate(education.id, { degreeType: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Field of Study <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  minLength={2}
                  maxLength={100}
                  value={education.fieldOfStudy}
                  onChange={(e) => onUpdate(education.id, { fieldOfStudy: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                maxLength={100}
                value={education.location}
                onChange={(e) => onUpdate(education.id, { location: e.target.value })}
                placeholder="Stanford, CA"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={education.startDate}
                  onChange={(e) => onUpdate(education.id, { startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={education.endDate}
                  onChange={(e) => onUpdate(education.id, { endDate: e.target.value })}
                  disabled={education.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`current-edu-${education.id}`}
                checked={education.isCurrent}
                onCheckedChange={(checked) =>
                  onUpdate(education.id, {
                    isCurrent: checked === true,
                    endDate: checked ? "" : education.endDate,
                  })
                }
              />
              <Label
                htmlFor={`current-edu-${education.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                I'm currently studying here
              </Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>GPA (optional)</Label>
                <Input
                  maxLength={20}
                  pattern="^[0-9./ ]+$"
                  value={education.gpa}
                  onChange={(e) => onUpdate(education.id, { gpa: e.target.value })}
                  placeholder="3.8 / 4.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Achievements & Activities (optional)</Label>
              <Textarea
                value={education.achievements.join("\n")}
                onChange={(e) =>
                  onUpdate(education.id, {
                    achievements: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="• Dean's List\n• President of CS Club\n• Hackathon winner"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                One achievement per line
              </p>
            </div>

            <div className="space-y-2">
              <Label>Relevant Coursework (optional)</Label>
              <Input
                value={education.relevantCoursework.join(", ")}
                onChange={(e) =>
                  onUpdate(education.id, {
                    relevantCoursework: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Data Structures, Algorithms, Machine Learning"
              />
              <p className="text-xs text-muted-foreground">Comma-separated list</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedEducationForm({ className }: EnhancedEducationFormProps) {
  const educationList = useEducation();
  const addEducation = useResumeBuilderStore((state) => state.addEducation);
  const updateEducation = useResumeBuilderStore((state) => state.updateEducation);
  const removeEducation = useResumeBuilderStore((state) => state.removeEducation);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAddEducation = () => {
    addEducation();
    const newId = useResumeBuilderStore.getState().data.education.at(-1)?.id;
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
          <h3 className="font-medium">Education</h3>
          <p className="text-sm text-muted-foreground">
            Add your educational background
          </p>
        </div>
        <Button onClick={handleAddEducation} size="sm">
          <Plus className="size-4 mr-1" />
          Add Education
        </Button>
      </div>

      {educationList.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No education added yet</p>
          <Button onClick={handleAddEducation} variant="outline">
            <Plus className="size-4 mr-1" />
            Add your first education
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {educationList
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((education) => (
              <EducationCard
                key={education.id}
                education={education}
                isExpanded={expandedIds.has(education.id)}
                onToggle={() => toggleExpand(education.id)}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            ))}
        </div>
      )}
    </div>
  );
}
