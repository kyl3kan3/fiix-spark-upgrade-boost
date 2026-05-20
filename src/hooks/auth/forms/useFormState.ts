
import { useState } from "react";
import { FormStateData } from "@/types/forms";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";

export function useFormState() {
 const initialEmail =
 typeof window !== "undefined"
 ? localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_EMAIL) || ""
 : "";

 const [formData, setFormData] = useState<FormStateData>({
 email: initialEmail,
 password: "",
 name: "",
 companyName: "",
 rememberMe: true
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
