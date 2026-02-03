import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeData } from "./types";

interface ProfileFormProps {
  name: string;
  title: string;
  summary: string;
  onUpdateData: (field: keyof ResumeData, value: string) => void;
}

export default function ProfileForm({ name, title, summary, onUpdateData }: ProfileFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => onUpdateData('name', e.target.value)} 
          placeholder="Alex Doe" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Headline</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => onUpdateData('title', e.target.value)} 
          placeholder="Frontend Engineer" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea 
          id="summary" 
          value={summary} 
          onChange={(e) => onUpdateData('summary', e.target.value)} 
          placeholder="Brief summary" 
          rows={6} 
        />
      </div>
    </div>
  );
}
