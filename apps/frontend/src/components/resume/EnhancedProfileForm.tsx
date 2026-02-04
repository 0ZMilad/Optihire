"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useResumeBuilderStore, usePersonalInfo, useSummary } from "@/stores/resume-builder-store";
import type { PersonalInfo } from "./types";

interface EnhancedProfileFormProps {
  className?: string;
}

export default function EnhancedProfileForm({ className }: EnhancedProfileFormProps) {
  const personal = usePersonalInfo();
  const summary = useSummary();
  const updatePersonalInfo = useResumeBuilderStore((state) => state.updatePersonalInfo);
  const updateSummary = useResumeBuilderStore((state) => state.updateSummary);

  const handlePersonalChange = <K extends keyof PersonalInfo>(field: K, value: string) => {
    updatePersonalInfo(field, value);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={personal.fullName}
              onChange={(e) => handlePersonalChange('fullName', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={personal.email}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={personal.phone}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={personal.location}
              onChange={(e) => handlePersonalChange('location', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
        </div>

        {/* Links */}
        <div className="pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Links</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={personal.linkedinUrl}
                onChange={(e) => handlePersonalChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub</Label>
              <Input
                id="githubUrl"
                type="url"
                value={personal.githubUrl}
                onChange={(e) => handlePersonalChange('githubUrl', e.target.value)}
                placeholder="https://github.com/johndoe"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio / Website</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={personal.portfolioUrl}
              onChange={(e) => handlePersonalChange('portfolioUrl', e.target.value)}
              placeholder="https://johndoe.com"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="pt-2 space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="A brief professional summary highlighting your key achievements and career objectives..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            {summary.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
