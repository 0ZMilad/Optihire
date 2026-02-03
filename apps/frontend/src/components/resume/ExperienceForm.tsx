import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "./types";

interface ExperienceFormProps {
  experience: string;
  onUpdateData: (field: keyof ResumeData, value: string) => void;
}

export default function ExperienceForm({ experience, onUpdateData }: ExperienceFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="experience">Experience</Label>
      <Textarea 
        id="experience" 
        value={experience} 
        onChange={(e) => onUpdateData('experience', e.target.value)} 
        placeholder="Company — Role — Impact" 
        rows={12} 
      />
    </div>
  );
}
