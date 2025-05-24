
import { useState } from "react";
import { FormStateData } from "@/types/forms";

export function useFormState() {
  const [formData, setFormData] = useState<FormStateData>({
    email: "",
    password: "",
    name: "",
    companyName: "",
    rememberMe: false
  });

  const setEmail = (email: string) => 
    setFormData(prev => ({ ...prev, email }));
  
  const setPassword = (password: string) => 
    setFormData(prev => ({ ...prev, password }));
  
  const setName = (name: string) => 
    setFormData(prev => ({ ...prev, name }));
  
  const setCompanyName = (companyName: string) => 
    setFormData(prev => ({ ...prev, companyName }));
  
  const setRememberMe = (rememberMe: boolean) => 
    setFormData(prev => ({ ...prev, rememberMe }));

  return {
    formData,
    setEmail,
    setPassword,
    setName,
    setCompanyName,
    setRememberMe
  };
}
