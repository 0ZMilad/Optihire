import { apiClient } from "./client";
import { supabase } from "./supabase";
import { ResumeParseStatusResponse, ResumeRead, ResumeListItem, ResumeComplete, ResumeUploadResponse, ResumeCreate } from "./types";
import type { ResumeBuilderData } from "../components/resume/types";

// Transform frontend ResumeBuilderData to backend ResumeCreate format
function transformToResumeCreate(data: ResumeBuilderData, userId: string): ResumeCreate {
  // Helper function to convert empty strings to null
  const emptyToNull = (value: string | undefined | null): string | null => {
    return value && value.trim() ? value.trim() : null;
  };

  return {
    user_id: userId,
    version_name: data.versionName,
    template_id: data.templateId || null,
    is_primary: data.isPrimary,
    full_name: emptyToNull(data.personal.fullName),
    email: emptyToNull(data.personal.email),
    phone: emptyToNull(data.personal.phone),
    location: emptyToNull(data.personal.location),
    linkedin_url: emptyToNull(data.personal.linkedinUrl),
    github_url: emptyToNull(data.personal.githubUrl),
    portfolio_url: emptyToNull(data.personal.portfolioUrl),
    professional_summary: emptyToNull(data.summary),
  };
}

// Transform frontend ResumeBuilderData to backend ResumeUpdate format
function transformToResumeUpdate(data: ResumeBuilderData): Partial<ResumeRead> {
  // Helper function to convert empty strings to null
  const emptyToNull = (value: string | undefined | null): string | null => {
    return value && value.trim() ? value.trim() : null;
  };

  return {
    version_name: data.versionName,
    template_id: data.templateId || null,
    is_primary: data.isPrimary,
    full_name: emptyToNull(data.personal.fullName),
    email: emptyToNull(data.personal.email),
    phone: emptyToNull(data.personal.phone),
    location: emptyToNull(data.personal.location),
    linkedin_url: emptyToNull(data.personal.linkedinUrl),
    github_url: emptyToNull(data.personal.githubUrl),
    portfolio_url: emptyToNull(data.personal.portfolioUrl),
    professional_summary: emptyToNull(data.summary),
  };
}

export const saveResume = async (data: ResumeBuilderData) => {
  if (data.id) {
    // Update existing resume
    const updateData = transformToResumeUpdate(data);
    return await updateResume(data.id, updateData);
  } else {
    // Create new resume
    return await createResume(data);
  }
};

export const createResume = async (data: ResumeBuilderData) => {
  // Get current user from Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Basic validation
  if (!data.versionName?.trim()) {
    throw new Error("Version name is required");
  }

  // Transform frontend data to backend format
  const resumeCreateData = transformToResumeCreate(data, session.user.id);

  const response = await apiClient.post<ResumeRead>("/api/v1/resumes", resumeCreateData);
  return response.data;
};

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);   

  const response = await apiClient.post<ResumeUploadResponse>("/api/v1/resumes/upload", formData, { 
    headers: {
        "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export const getResumeParseStatus = async (resumeId: string) => {
  const response = await apiClient.get<ResumeParseStatusResponse>(`/api/v1/resumes/parse-status/${resumeId}`);
  
  return response.data;
}

export const getResumeData = async (resumeId: string) => {
  const response = await apiClient.get<ResumeRead>(`/api/v1/resumes/${resumeId}`);
  
  return response.data;
}

export const getResumeCompleteData = async (resumeId: string) => {
  const response = await apiClient.get<ResumeComplete>(`/api/v1/resumes/${resumeId}/complete`);
  
  return response.data;
}

export const updateResume = async (resumeId: string, data: Partial<ResumeRead>) => {
  const response = await apiClient.put<ResumeRead>(`/api/v1/resumes/${resumeId}`, data);
  
  return response.data;
}

export const getUserResumes = async () => {
  const response = await apiClient.get<ResumeListItem[]>(`/api/v1/resumes`);
  return response.data;
}

export const deleteAllResumes = async () => {
  const response = await apiClient.delete(`/api/v1/resumes/all`);
  return response.data;
}

export const duplicateResume = async (resumeId: string, newVersionName?: string) => {
  const response = await apiClient.post<ResumeRead>(`/api/v1/resumes/${resumeId}/duplicate`, {
    new_version_name: newVersionName
  });
  return response.data;
}

export const deleteResume = async (resumeId: string) => {
  const response = await apiClient.delete(`/api/v1/resumes/${resumeId}`);
  return response.data;
}

/**
 * Download a resume as a generated PDF file.
 * Triggers a browser file-save dialog.
 */
export const downloadResumePdf = async (resumeId: string, filename?: string) => {
  const response = await apiClient.get(`/api/v1/resumes/${resumeId}/download`, {
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header if not provided
  if (!filename) {
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename="?(.+?)"?$/);
    filename = match?.[1] ?? "resume.pdf";
  }

  // Create a temporary link to trigger the browser download
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}