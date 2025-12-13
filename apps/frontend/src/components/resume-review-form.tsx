import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { ResumeRead } from "@/middle-service/types"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ResumeReviewFormProps {
  resumeData: ResumeRead
  onSave: (data: Partial<ResumeRead>) => Promise<void>
  onCancel: () => void
}

export function ResumeReviewForm({ resumeData, onSave, onCancel }: ResumeReviewFormProps) {
  const [formData, setFormData] = useState({
    full_name: resumeData.full_name || "",
    email: resumeData.email || "",
    phone: resumeData.phone || "",
    location: resumeData.location || "",
    linkedin_url: resumeData.linkedin_url || "",
    github_url: resumeData.github_url || "",
    portfolio_url: resumeData.portfolio_url || "",
    professional_summary: resumeData.professional_summary || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Review Extracted Data</CardTitle>
        <CardDescription>
          Our AI extracted this information. Please verify and edit any missing details before continuing.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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
                  value={formData.full_name}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </div>

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
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://myportfolio.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional_summary">Professional Summary</Label>
            <Textarea
              id="professional_summary"
              name="professional_summary"
              value={formData.professional_summary}
              onChange={handleChange}
              placeholder="Brief overview of your professional background..."
              rows={5}
              className="resize-y min-h-[100px]"
            />
          </div>

        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Upload Different Resume
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
        </CardFooter>
      </form>
    </Card>
  )
}