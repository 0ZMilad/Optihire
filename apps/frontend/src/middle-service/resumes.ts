import { apiClient } from "./client";

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  
  formData.append("file", file);  

  const response = await apiClient.post("/resumes/upload", formData, { 
    headers: {
        "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}