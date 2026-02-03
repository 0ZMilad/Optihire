import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "./ProfileForm";
import ExperienceForm from "./ExperienceForm";
import SkillsForm from "./SkillsForm";
import type { ResumeData } from "./types";

interface ResumeEditorProps {
  resumeData: ResumeData;
  onUpdateData: (field: keyof ResumeData, value: string) => void;
  className?: string;
}

export default function ResumeEditor({ resumeData, onUpdateData, className }: ResumeEditorProps) {
  return (
    <Tabs defaultValue="profile" className={className}>
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <ProfileForm 
          name={resumeData.name}
          title={resumeData.title}
          summary={resumeData.summary}
          onUpdateData={onUpdateData}
        />
      </TabsContent>
      
      <TabsContent value="experience">
        <ExperienceForm 
          experience={resumeData.experience}
          onUpdateData={onUpdateData}
        />
      </TabsContent>
      
      <TabsContent value="skills">
        <SkillsForm 
          skills={resumeData.skills}
          onUpdateData={onUpdateData}
        />
      </TabsContent>
    </Tabs>
  );
}
