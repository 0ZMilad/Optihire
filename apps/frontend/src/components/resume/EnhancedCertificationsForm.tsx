"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Award, ExternalLink } from "lucide-react";
import { useResumeBuilderStore, useCertifications } from "@/stores/resume-builder-store";
import type { Certification } from "./types";
import { cn } from "@/lib/utils";

interface EnhancedCertificationsFormProps {
  className?: string;
}

function CertificationCard({
  certification,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  certification: Certification;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Certification>) => void;
  onRemove: (id: string) => void;
}) {
  const isExpired = certification.expiryDate 
    ? new Date(certification.expiryDate) < new Date() 
    : false;

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
              <Award className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">
                {certification.certificationName || "New Certification"}
              </span>
              {isExpired && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  Expired
                </span>
              )}
              {certification.credentialUrl && (
                <a
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            {certification.issuingOrganization && (
              <p className="text-sm text-muted-foreground truncate">
                {certification.issuingOrganization}
              </p>
            )}
            {certification.issueDate && (
              <p className="text-xs text-muted-foreground">
                Issued: {certification.issueDate}
                {certification.expiryDate && ` • Expires: ${certification.expiryDate}`}
              </p>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onToggle} className="shrink-0">
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(certification.id)}
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
                <Label>
                  Certification Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  minLength={2}
                  maxLength={150}
                  value={certification.certificationName}
                  onChange={(e) => onUpdate(certification.id, { certificationName: e.target.value })}
                  placeholder="AWS Solutions Architect"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Issuing Organization <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  minLength={2}
                  maxLength={100}
                  value={certification.issuingOrganization}
                  onChange={(e) => onUpdate(certification.id, { issuingOrganization: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Issue Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="month"
                  required
                  value={certification.issueDate}
                  onChange={(e) => onUpdate(certification.id, { issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="month"
                  value={certification.expiryDate}
                  onChange={(e) => onUpdate(certification.id, { expiryDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if the certification doesn't expire
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Credential ID (optional)</Label>
                <Input
                  maxLength={100}
                  value={certification.credentialId}
                  onChange={(e) => onUpdate(certification.id, { credentialId: e.target.value })}
                  placeholder="ABC123XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label>Credential URL (optional)</Label>
                <Input
                  type="url"
                  pattern="^https?://.*"
                  value={certification.credentialUrl}
                  onChange={(e) => onUpdate(certification.id, { credentialUrl: e.target.value })}
                  placeholder="https://www.credly.com/badges/..."
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedCertificationsForm({ className }: EnhancedCertificationsFormProps) {
  const certifications = useCertifications();
  const addCertification = useResumeBuilderStore((state) => state.addCertification);
  const updateCertification = useResumeBuilderStore((state) => state.updateCertification);
  const removeCertification = useResumeBuilderStore((state) => state.removeCertification);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAddCertification = () => {
    addCertification();
    const newId = useResumeBuilderStore.getState().data.certifications.at(-1)?.id;
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
          <h3 className="font-medium">Certifications</h3>
          <p className="text-sm text-muted-foreground">
            Add your professional certifications and licenses
          </p>
        </div>
        <Button onClick={handleAddCertification} size="sm">
          <Plus className="size-4 mr-1" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No certifications added yet</p>
          <Button onClick={handleAddCertification} variant="outline">
            <Plus className="size-4 mr-1" />
            Add your first certification
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((certification) => (
              <CertificationCard
                key={certification.id}
                certification={certification}
                isExpanded={expandedIds.has(certification.id)}
                onToggle={() => toggleExpand(certification.id)}
                onUpdate={updateCertification}
                onRemove={removeCertification}
              />
            ))}
        </div>
      )}
    </div>
  );
}
