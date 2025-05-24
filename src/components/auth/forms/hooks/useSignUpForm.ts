
import { useState } from "react";
import { useSignUp } from "@/hooks/auth/actions/useSignUp";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

export function useSignUpForm(onError: (message: string) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const { signUp, isLoading } = useSignUp();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignUpForm } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(email, password, name, companyName);
    if (!validation.isValid) {
      onError(validation.error!);
      return;
    }
    
    const result = await signUp(email, password, {
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      company_name: companyName
    });
    
    if (result.success) {
      localStorage.setItem("pending_auth_email", email);
      handleAuthSuccess();
    } else if (result.error) {
      onError(result.error);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    companyName,
    setCompanyName,
    isLoading,
    handleSubmit
  };
}
