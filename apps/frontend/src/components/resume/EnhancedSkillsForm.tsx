"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { useResumeBuilderStore, useSkills } from "@/stores/resume-builder-store";
import type { Skill } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedSkillsFormProps {
  className?: string;
}

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Databases",
  "Cloud & DevOps",
  "Tools & Software",
  "Soft Skills",
  "Languages",
  "Other",
];

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

function SkillBadge({ 
  skill, 
  onRemove 
}: { 
  skill: Skill; 
  onRemove: (id: string) => void;
}) {
  const proficiencyColors = {
    beginner: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    expert: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm",
        proficiencyColors[skill.proficiencyLevel]
      )}
    >
      {skill.skillName}
      <button
        type="button"
        onClick={() => onRemove(skill.id)}
        className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
        aria-label={`Remove ${skill.skillName}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function SkillInputForm({
  onAdd,
}: {
  onAdd: (skill: Partial<Skill>) => void;
}) {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState<Skill["proficiencyLevel"]>("intermediate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    onAdd({
      skillName: skillName.trim(),
      skillCategory: category,
      proficiencyLevel: proficiency,
    });

    setSkillName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="skillName">
            Skill Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="skillName"
            required
            minLength={1}
            maxLength={50}
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g., React, Python"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="proficiency">Proficiency</Label>
          <Select 
            value={proficiency} 
            onValueChange={(v) => setProficiency(v as Skill["proficiencyLevel"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFICIENCY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={!skillName.trim()}>
            <Plus className="size-4 mr-1" />
            Add Skill
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function EnhancedSkillsForm({ className }: EnhancedSkillsFormProps) {
  const skills = useSkills();
  const addSkill = useResumeBuilderStore((state) => state.addSkill);
  const updateSkill = useResumeBuilderStore((state) => state.updateSkill);
  const removeSkill = useResumeBuilderStore((state) => state.removeSkill);

  const handleAddSkill = (skillData: Partial<Skill>) => {
    // First add an empty skill
    addSkill();
    // Then update it with the provided data
    const newSkill = useResumeBuilderStore.getState().data.skills.at(-1);
    if (newSkill) {
      updateSkill(newSkill.id, skillData);
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.skillCategory || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="font-medium">Skills</h3>
        <p className="text-sm text-muted-foreground">
          Add your technical and soft skills with proficiency levels
        </p>
      </div>

      {/* Skill input form */}
      <Card>
        <CardContent className="pt-4">
          <SkillInputForm onAdd={handleAddSkill} />
        </CardContent>
      </Card>

      {/* Skills display */}
      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No skills added yet. Add your first skill above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categorySkills
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((skill) => (
                    <SkillBadge
                      key={skill.id}
                      skill={skill}
                      onRemove={removeSkill}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick add section */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-2">
          Quick add popular skills:
        </p>
        <div className="flex flex-wrap gap-2">
          {["JavaScript", "Python", "React", "Node.js", "SQL", "Git", "AWS", "Docker"]
            .filter(name => !skills.some(s => s.skillName.toLowerCase() === name.toLowerCase()))
            .slice(0, 6)
            .map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => handleAddSkill({ 
                  skillName: name, 
                  skillCategory: "Programming Languages",
                  proficiencyLevel: "intermediate"
                })}
              >
                <Plus className="size-3 mr-1" />
                {name}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
