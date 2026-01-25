import { useState, useCallback, memo } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { ResumeComplete, ExperienceRead, EducationRead, SkillRead } from "@/middle-service/types"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PdfViewer } from "@/components/pdf-viewer"

interface ResumeReviewFormProps {
  resumeData: ResumeComplete
  onSave: (data: Partial<ResumeComplete>) => Promise<void>
  onCancel: () => void
  /** Whether to show the PDF viewer in split view mode */
  showPdfViewer?: boolean
}

const PersonalDetails = memo(({ 
  data, 
  errors, 
  onChange 
}: { 
  data: { full_name: string; email: string; phone: string; location: string };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Personal Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
        <Input
          id="full_name"
          name="full_name"
          value={data.full_name}
          onChange={onChange}
          placeholder="John Doe"
          className={errors.full_name ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.full_name && (
          <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {errors.full_name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={onChange}
          placeholder="john@example.com"
          className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={data.phone}
          onChange={onChange}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={data.location}
          onChange={onChange}
          placeholder="New York, NY"
        />
      </div>
    </div>
  </div>
));
PersonalDetails.displayName = "PersonalDetails";

const ProfessionalLinks = memo(({ 
  data, 
  onChange 
}: { 
  data: { linkedin_url: string; github_url: string; portfolio_url: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Professional Links
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          value={data.linkedin_url}
          onChange={onChange}
          placeholder="https://linkedin.com/in/..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="github_url">GitHub URL</Label>
        <Input
          id="github_url"
          name="github_url"
          value={data.github_url}
          onChange={onChange}
          placeholder="https://github.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio_url">Portfolio URL</Label>
        <Input
          id="portfolio_url"
          name="portfolio_url"
          value={data.portfolio_url}
          onChange={onChange}
          placeholder="https://myportfolio.com"
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
  <div className="space-y-2">
    <Label htmlFor="professional_summary">Professional Summary</Label>
    <Textarea
      id="professional_summary"
      name="professional_summary"
      value={value}
      onChange={onChange}
      placeholder="Brief overview of your professional background..."
      rows={5}
      className="resize-y min-h-[100px]"
    />
  </div>
));
SummarySection.displayName = "SummarySection";

const SkillsSection = memo(({ skills }: { skills: SkillRead[] }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Skills
    </h3>
    <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted/20">
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <Badge key={index} variant="secondary">
            {skill.skill_name}
          </Badge>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No skills extracted.</p>
      )}
    </div>
  </div>
));
SkillsSection.displayName = "SkillsSection";

const ExperienceSection = memo(({ experiences }: { experiences: ExperienceRead[] }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Experience
    </h3>
    <div className="space-y-4">
      {experiences.length > 0 ? (
        experiences.map((exp, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex justify-between">
                <span>{exp.job_title} at {exp.company_name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {exp.start_date} - {exp.end_date || (exp.is_current ? "Present" : "")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {exp.description}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No experience extracted.</p>
      )}
    </div>
  </div>
));
ExperienceSection.displayName = "ExperienceSection";

const EducationSection = memo(({ education }: { education: EducationRead[] }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Education
    </h3>
    <div className="space-y-4">
      {education.length > 0 ? (
        education.map((edu, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex justify-between">
                <span>{edu.institution_name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {edu.start_date} - {edu.end_date || (edu.is_current ? "Present" : "")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{edu.degree_type} - {edu.field_of_study}</p>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  {edu.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No education extracted.</p>
      )}
    </div>
  </div>
));
EducationSection.displayName = "EducationSection";

export function ResumeReviewForm({ resumeData, onSave, onCancel, showPdfViewer = true }: ResumeReviewFormProps) {
  const [formData, setFormData] = useState({
    full_name: resumeData.full_name || "",
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      logger.error("Failed to save resume form", { error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full">
      {/* Split View Container - stacks on mobile, side-by-side on desktop */}
      <div className={`flex flex-col ${hasFileToShow ? 'lg:flex-row lg:gap-6' : ''}`}>
        
        {/* Left Panel: PDF Viewer (only shown if file available) */}
        {hasFileToShow && (
          <div className="w-full lg:w-1/2 mb-6 lg:mb-0 lg:sticky lg:top-0 lg:self-start">
            <div className="h-[400px] lg:h-[calc(100vh-200px)] min-h-[500px]">
              <PdfViewer 
                url={fileUrl} 
                filename={resumeData.version_name}
                className="h-full rounded-lg border"
              />
            </div>
          </div>
        )}

        {/* Right Panel: Editable Form */}
        <div className={`w-full ${hasFileToShow ? 'lg:w-1/2' : 'max-w-4xl mx-auto'}`}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              <PersonalDetails 
                data={{
                  full_name: formData.full_name,
                  email: formData.email,
                  phone: formData.phone,
                  location: formData.location
                }}
                errors={errors}
                onChange={handleChange}
              />

              <ProfessionalLinks 
                data={{
                  linkedin_url: formData.linkedin_url,
                  github_url: formData.github_url,
                  portfolio_url: formData.portfolio_url
                }}
                onChange={handleChange}
              />

              <SummarySection 
                value={formData.professional_summary}
                onChange={handleChange}
              />

              <SkillsSection skills={formData.skills} />
              <ExperienceSection experiences={formData.experiences} />
              <EducationSection education={formData.education} />
            </div>

            <div className="flex justify-between border-t pt-6 mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              
              <Button type="submit" disabled={isSaving}>
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