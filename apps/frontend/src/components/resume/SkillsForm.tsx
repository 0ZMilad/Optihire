import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "./types";

interface SkillsFormProps {
  skills: string;
  onUpdateData: (field: keyof ResumeData, value: string) => void;
}

export default function SkillsForm({ skills, onUpdateData }: SkillsFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="skills">Skills</Label>
      <Textarea 
        id="skills" 
        value={skills} 
        onChange={(e) => onUpdateData('skills', e.target.value)} 
        placeholder="Comma-separated skills" 
        rows={8} 
      />
    </div>
  );
}
