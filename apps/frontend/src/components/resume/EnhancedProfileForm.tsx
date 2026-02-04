"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useResumeBuilderStore, usePersonalInfo, useSummary } from "@/stores/resume-builder-store";
import type { PersonalInfo } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedProfileFormProps {
  className?: string;
}

// Validation patterns
const PHONE_PATTERN = "^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$";
const URL_PATTERN = "^https?://.*";

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
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              required
              minLength={2}
              maxLength={100}
              value={personal.fullName}
              onChange={(e) => handlePersonalChange('fullName', e.target.value)}
              placeholder="John Doe"
              aria-describedby="fullName-hint"
            />
            <p id="fullName-hint" className="text-xs text-muted-foreground">
              Required. Your professional name as it should appear on the resume.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={personal.email}
              onChange={(e) => handlePersonalChange('email', e.target.value)}
              placeholder="john@example.com"
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-xs text-muted-foreground">
              Required. A valid email address for employers to contact you.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              pattern={PHONE_PATTERN}
              value={personal.phone}
              onChange={(e) => handlePersonalChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              aria-describedby="phone-hint"
            />
            <p id="phone-hint" className="text-xs text-muted-foreground">
              Include country code for international applications.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              maxLength={100}
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
                pattern={URL_PATTERN}
                value={personal.linkedinUrl}
                onChange={(e) => handlePersonalChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
                aria-describedby="linkedin-hint"
              />
              <p id="linkedin-hint" className="text-xs text-muted-foreground">
                Must start with https://
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub</Label>
              <Input
                id="githubUrl"
                type="url"
                pattern={URL_PATTERN}
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
              pattern={URL_PATTERN}
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
            maxLength={500}
            value={summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="A brief professional summary highlighting your key achievements and career objectives..."
            rows={5}
            aria-describedby="summary-hint"
          />
          <p id="summary-hint" className={cn(
            "text-xs",
            summary.length > 450 ? "text-amber-600" : "text-muted-foreground",
            summary.length >= 500 && "text-destructive"
          )}>
            {summary.length}/500 characters
            {summary.length > 450 && summary.length < 500 && " - approaching limit"}
            {summary.length >= 500 && " - limit reached"}
          </p>
        </div>
      </div>
    </div>
  );
}
