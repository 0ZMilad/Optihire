import { apiClient } from "./client";

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  
  formData.append("file", file);  

  const response = await apiClient.post("/api/v1/resumes/upload", formData, { 
    headers: {
        "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}