
import { useState, useEffect } from "react";
import { FormStateData } from "@/types/forms";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";

const safeGetItem = (key: string): string => {
  try {
    if (typeof window === "undefined") return "";
    if (typeof localStorage === "undefined" || localStorage === null) return "";
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

export function useFormState() {
 const initialEmail = safeGetItem(AUTH_STORAGE_KEYS.PENDING_EMAIL);

 const [formData, setFormData] = useState<FormStateData>({
 email: initialEmail,
 password: "",
 name: "",
 companyName: "",
 rememberMe: true
 });

  // If the invitation email is resolved asynchronously (after the form
  // already rendered), prefill it as soon as it lands.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string" && detail) {
        setFormData(prev => (prev.email ? prev : { ...prev, email: detail }));
      }
    };
    window.addEventListener("pending-email-resolved", handler);
    return () => window.removeEventListener("pending-email-resolved", handler);
  }, []);

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
