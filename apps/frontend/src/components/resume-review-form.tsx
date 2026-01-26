import { useState, useCallback, memo } from "react"
import { Loader2, AlertCircle, User, Link2, FileText, Briefcase, GraduationCap, Sparkles, Plus, X } from "lucide-react"
import { ResumeComplete, ExperienceRead, EducationRead, SkillRead } from "@/middle-service/types"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PdfViewer } from "@/components/pdf-viewer"

interface ResumeReviewFormProps {
  resumeData: ResumeComplete
  onSave: (data: Partial<ResumeComplete>) => Promise<void>
  onCancel: () => void
  /** Whether to show the PDF viewer in split view mode */
  showPdfViewer?: boolean
}

const SectionHeader = memo(({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description?: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <h3 className="font-semibold text-sm">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  </div>
));
SectionHeader.displayName = "SectionHeader";

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Apply formatting based on length
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

// Unformat phone number to raw digits
const unformatPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 10);
};

const PersonalDetails = memo(({ 
  data, 
  errors, 
  onChange,
  onPhoneChange 
}: { 
  data: { first_name: string; last_name: string; email: string; phone: string; location: string };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string) => void;
}) => (
  <div className="space-y-3">
    <SectionHeader 
      icon={User} 
      title="Personal Details" 
      description="Your basic contact information"
    />
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="first_name" className="text-sm font-medium">
          First Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="first_name"
          name="first_name"
          value={data.first_name}
          onChange={onChange}
          placeholder="John"
          className={errors.first_name ? "border-destructive focus-visible:ring-destructive" : "border-slate-300"}
        />
        {errors.first_name && (
          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {errors.first_name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name" className="text-sm font-medium">
          Last Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="last_name"
          name="last_name"
          value={data.last_name}
          onChange={onChange}
          placeholder="Doe"
          className={errors.last_name ? "border-destructive focus-visible:ring-destructive" : "border-slate-300"}
        />
        {errors.last_name && (
          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {errors.last_name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={onChange}
          placeholder="john@example.com"
          className={errors.email ? "border-destructive focus-visible:ring-destructive" : "border-slate-300"}
        />
        {errors.email && (
          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formatPhoneNumber(data.phone)}
          onChange={(e) => onPhoneChange(unformatPhoneNumber(e.target.value))}
          placeholder="(555) 000-0000"
          className="border-slate-300"
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
        <Input
          id="location"
          name="location"
          value={data.location}
          onChange={onChange}
          placeholder="New York, NY"
          className="border-slate-300"
        />
      </div>
    </div>
  </div>
));
PersonalDetails.displayName = "PersonalDetails";

// Extract LinkedIn handle from full URL
const extractLinkedInHandle = (url: string): string => {
  if (!url) return '';
  // Match various LinkedIn URL formats
  const match = url.match(/(?:linkedin\.com\/in\/|^)([^\/\?]+)/);
  return match ? match[1] : url;
};

// Build full LinkedIn URL from handle
const buildLinkedInUrl = (handle: string): string => {
  if (!handle) return '';
  // If it's already a full URL, extract just the handle part
  const cleanHandle = extractLinkedInHandle(handle);
  return `https://linkedin.com/in/${cleanHandle}`;
};

const ProfessionalLinks = memo(({ 
  data, 
  onChange,
  onLinkedInChange 
}: { 
  data: { linkedin_url: string; github_url: string; portfolio_url: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLinkedInChange: (value: string) => void;
}) => (
  <div className="space-y-3">
    <SectionHeader 
      icon={Link2} 
      title="Professional Links" 
      description="Add your online presence"
    />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="space-y-2">
        <Label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-xs text-muted-foreground bg-muted border border-r-0 border-slate-300 rounded-l-md whitespace-nowrap">
            linkedin.com/in/
          </span>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            value={extractLinkedInHandle(data.linkedin_url)}
            onChange={(e) => onLinkedInChange(e.target.value ? buildLinkedInUrl(e.target.value) : '')}
            placeholder="johndoe"
            className="border-slate-300 rounded-l-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="github_url" className="text-sm font-medium">GitHub URL</Label>
        <Input
          id="github_url"
          name="github_url"
          value={data.github_url}
          onChange={onChange}
          placeholder="https://github.com/..."
          className="border-slate-300"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio_url" className="text-sm font-medium">Portfolio URL</Label>
        <Input
          id="portfolio_url"
          name="portfolio_url"
          value={data.portfolio_url}
          onChange={onChange}
          placeholder="https://myportfolio.com"
          className="border-slate-300"
        />
      </div>
    </div>
  </div>
));
ProfessionalLinks.displayName = "ProfessionalLinks";

const SummarySection = memo(({ 
  value, 
  onChange 
}: { 
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="space-y-3">
    <SectionHeader 
      icon={FileText} 
      title="Professional Summary" 
      description="A brief overview of your career"
    />
    <Textarea
      id="professional_summary"
      name="professional_summary"
      value={value}
      onChange={onChange}
      placeholder="Brief overview of your professional background..."
      rows={3}
      className="resize-y min-h-[80px] border-slate-300"
    />
  </div>
));
SummarySection.displayName = "SummarySection";

const SkillsSection = memo(({ 
  skills, 
  onSkillsChange 
}: { 
  skills: SkillRead[];
  onSkillsChange: (skills: SkillRead[]) => void;
}) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      const skill: SkillRead = {
        id: Date.now().toString(),
        resume_id: '',
        skill_name: newSkill.trim(),
        skill_category: null,
        proficiency_level: null,
        years_of_experience: null,
        is_primary: false,
        display_order: skills.length,
        created_at: new Date().toISOString(),
      };
      onSkillsChange([...skills, skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeader 
        icon={Sparkles} 
        title="Skills" 
        description="Your technical and soft skills"
      />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {skills.map((skill, index) => (
            <div key={index} className="relative group">
              <Badge 
                variant="secondary"
                className="px-2 py-1 text-xs pr-6"
              >
                {skill.skill_name}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a skill (e.g., React, Python)..."
            className="text-xs border-slate-300"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
            disabled={!newSkill.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
SkillsSection.displayName = "SkillsSection";

const ExperienceSection = memo(({ 
  experiences, 
  onExperiencesChange 
}: { 
  experiences: ExperienceRead[];
  onExperiencesChange: (experiences: ExperienceRead[]) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExp: ExperienceRead = {
      id: Date.now().toString(),
      resume_id: '',
      company_name: '',
      job_title: '',
      location: null,
      start_date: '',
      end_date: null,
      is_current: false,
      description: null,
      achievements: [],
      skills_used: [],
      display_order: experiences.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onExperiencesChange([...experiences, newExp]);
    setEditingIndex(experiences.length);
    setIsAdding(false);
  };

  const updateExperience = (index: number, updates: Partial<ExperienceRead>) => {
    const updated = experiences.map((exp, i) => 
      i === index ? { ...exp, ...updates } : exp
    );
    onExperiencesChange(updated);
  };

  const removeExperience = (index: number) => {
    onExperiencesChange(experiences.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionHeader 
          icon={Briefcase} 
          title="Work Experience" 
          description="Your professional history"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </Button>
      </div>
      
      <div className="space-y-3">
        {experiences.map((exp, index) => (
          <div key={index} className="p-3 rounded-md border bg-muted/20 relative">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Job Title *</Label>
                    <Input
                      value={exp.job_title}
                      onChange={(e) => updateExperience(index, { job_title: e.target.value })}
                      placeholder="Software Engineer"
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Company *</Label>
                    <Input
                      value={exp.company_name}
                      onChange={(e) => updateExperience(index, { company_name: e.target.value })}
                      placeholder="Tech Corp"
                      className="text-xs border-slate-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      value={exp.start_date}
                      onChange={(e) => updateExperience(index, { start_date: e.target.value })}
                      placeholder="Jan 2020"
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      value={exp.end_date || ''}
                      onChange={(e) => updateExperience(index, { end_date: e.target.value, is_current: false })}
                      placeholder="Dec 2023"
                      disabled={exp.is_current}
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) => updateExperience(index, { is_current: e.target.checked, end_date: e.target.checked ? '' : exp.end_date })}
                        className="rounded"
                      />
                      <span>Current</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={exp.description || ''}
                    onChange={(e) => updateExperience(index, { description: e.target.value })}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    className="text-xs resize-y border-slate-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(null)}
                  >
                    Done
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExperience(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{exp.job_title || 'Untitled Position'}</h4>
                    <p className="text-xs text-muted-foreground">{exp.company_name || 'Unknown Company'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {exp.start_date} - {exp.end_date || (exp.is_current ? "Present" : "")}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(index)}
                      className="h-6 w-6 p-0"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {exp.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isAdding && (
          <div className="p-3 rounded-md border border-dashed border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Click "Add" to create a new experience entry</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={addExperience}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {experiences.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground italic">No work experience added yet.</p>
        )}
      </div>
    </div>
  );
});
ExperienceSection.displayName = "ExperienceSection";

const EducationSection = memo(({ 
  education, 
  onEducationChange 
}: { 
  education: EducationRead[];
  onEducationChange: (education: EducationRead[]) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEdu: EducationRead = {
      id: Date.now().toString(),
      resume_id: '',
      institution_name: '',
      degree_type: null,
      field_of_study: null,
      location: null,
      start_date: null,
      end_date: null,
      is_current: false,
      gpa: null,
      achievements: [],
      relevant_coursework: [],
      display_order: education.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onEducationChange([...education, newEdu]);
    setEditingIndex(education.length);
    setIsAdding(false);
  };

  const updateEducation = (index: number, updates: Partial<EducationRead>) => {
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, ...updates } : edu
    );
    onEducationChange(updated);
  };

  const removeEducation = (index: number) => {
    onEducationChange(education.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionHeader 
          icon={GraduationCap} 
          title="Education" 
          description="Your academic background"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Education
        </Button>
      </div>
      
      <div className="space-y-3">
        {education.map((edu, index) => (
          <div key={index} className="p-3 rounded-md border bg-muted/20 relative">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label className="text-xs">Institution Name *</Label>
                    <Input
                      value={edu.institution_name}
                      onChange={(e) => updateEducation(index, { institution_name: e.target.value })}
                      placeholder="University of Example"
                      className="text-xs border-slate-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Degree Type</Label>
                    <Input
                      value={edu.degree_type || ''}
                      onChange={(e) => updateEducation(index, { degree_type: e.target.value })}
                      placeholder="Bachelor's, Master's, PhD"
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Field of Study</Label>
                    <Input
                      value={edu.field_of_study || ''}
                      onChange={(e) => updateEducation(index, { field_of_study: e.target.value })}
                      placeholder="Computer Science"
                      className="text-xs border-slate-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      value={edu.start_date || ''}
                      onChange={(e) => updateEducation(index, { start_date: e.target.value })}
                      placeholder="2018"
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      value={edu.end_date || ''}
                      onChange={(e) => updateEducation(index, { end_date: e.target.value, is_current: false })}
                      placeholder="2022"
                      disabled={edu.is_current}
                      className="text-xs border-slate-300"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={edu.is_current}
                        onChange={(e) => updateEducation(index, { is_current: e.target.checked, end_date: e.target.checked ? '' : edu.end_date })}
                        className="rounded"
                      />
                      <span>Current</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(null)}
                  >
                    Done
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{edu.institution_name || 'Unknown Institution'}</h4>
                    <p className="text-xs text-muted-foreground">
                      {edu.degree_type}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {edu.start_date} - {edu.end_date || (edu.is_current ? "Present" : "")}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(index)}
                      className="h-6 w-6 p-0"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-0.5">
                    {edu.achievements.slice(0, 2).map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isAdding && (
          <div className="p-3 rounded-md border border-dashed border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Click "Add" to create a new education entry</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={addEducation}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {education.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground italic">No education added yet.</p>
        )}
      </div>
    </div>
  );
});
EducationSection.displayName = "EducationSection";

// Parse full name into first and last name
const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  // First part is first name, rest is last name
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

export function ResumeReviewForm({ resumeData, onSave, onCancel, showPdfViewer = true }: ResumeReviewFormProps) {
  // Parse the full_name into first and last name on initial load
  const { firstName: initialFirstName, lastName: initialLastName } = parseFullName(resumeData.full_name || '');
  
  const [formData, setFormData] = useState({
    first_name: initialFirstName,
    last_name: initialLastName,
    email: resumeData.email || "",
    phone: resumeData.phone || "",
    location: resumeData.location || "",
    linkedin_url: resumeData.linkedin_url || "",
    github_url: resumeData.github_url || "",
    portfolio_url: resumeData.portfolio_url || "",
    professional_summary: resumeData.professional_summary || "",
    skills: resumeData.skills || [],
    experiences: resumeData.experiences || [],
    education: resumeData.education || [],
    projects: resumeData.projects || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Determine if we have a viewable file
  const fileUrl = resumeData.file_url
  const hasFileToShow = showPdfViewer && !!fileUrl
  
  // Use split view when PDF is available
  const useSplitView = hasFileToShow

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      }
      return prev
    })
  }, [])

  const handlePhoneChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }))
  }, [])

  const handleLinkedInChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedin_url: value,
    }))
  }, [])

  const handleSkillsChange = useCallback((skills: SkillRead[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }))
  }, [])

  const handleExperiencesChange = useCallback((experiences: ExperienceRead[]) => {
    setFormData((prev) => ({
      ...prev,
      experiences,
    }))
  }, [])

  const handleEducationChange = useCallback((education: EducationRead[]) => {
    setFormData((prev) => ({
      ...prev,
      education,
    }))
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.first_name, formData.last_name, formData.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      // Combine first and last name back to full_name for the API
      const { first_name, last_name, ...rest } = formData
      const saveData = {
        ...rest,
        full_name: `${first_name.trim()} ${last_name.trim()}`.trim(),
      }
      await onSave(saveData)
    } catch (error) {
      logger.error("Failed to save resume form", { error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full w-full">
      {/* Split View Container - true 50/50 split */}
      <div className={`h-full flex flex-col ${useSplitView ? 'lg:flex-row lg:gap-6' : ''}`}>
        
        {/* Left Panel: PDF Viewer - exactly 50% */}
        {useSplitView && (
          <div className="h-[300px] lg:h-full lg:w-1/2 shrink-0 mb-4 lg:mb-0">
            <div className="h-full border rounded-lg overflow-hidden bg-muted/20">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-background">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Original Document</span>
              </div>
              <div className="h-[calc(100%-49px)]">
                <PdfViewer 
                  url={fileUrl} 
                  filename={resumeData.version_name}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Panel: Form - exactly 50% with scroll */}
        <div className={`${useSplitView ? 'lg:w-1/2 lg:h-full lg:overflow-y-auto' : 'max-w-3xl mx-auto'} flex-1 min-h-0`}>
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            {/* Form Sections */}
              <PersonalDetails 
                data={{
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  email: formData.email,
                  phone: formData.phone,
                  location: formData.location
                }}
                errors={errors}
                onChange={handleChange}
                onPhoneChange={handlePhoneChange}
              />

              <ProfessionalLinks 
                data={{
                  linkedin_url: formData.linkedin_url,
                  github_url: formData.github_url,
                  portfolio_url: formData.portfolio_url
                }}
                onChange={handleChange}
                onLinkedInChange={handleLinkedInChange}
              />

              <SummarySection 
                value={formData.professional_summary}
                onChange={handleChange}
              />

              <SkillsSection 
                skills={formData.skills} 
                onSkillsChange={handleSkillsChange}
              />
              <ExperienceSection 
                experiences={formData.experiences}
                onExperiencesChange={handleExperiencesChange}
              />
              <EducationSection 
                education={formData.education}
                onEducationChange={handleEducationChange}
              />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}