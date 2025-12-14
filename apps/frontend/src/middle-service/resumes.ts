import { apiClient } from "./client";
import { ResumeParseStatusResponse, ResumeRead, ResumeUploadResponse } from "./types";

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

export const updateResume = async (resumeId: string, data: Partial<ResumeRead>) => {
  const response = await apiClient.put<ResumeRead>(`/api/v1/resumes/${resumeId}`, data);
  
  return response.data;
}

export const getActiveResume = async () => {
  const response = await apiClient.get<ResumeRead>(`/api/v1/resumes/active`);
  return response.data;
}