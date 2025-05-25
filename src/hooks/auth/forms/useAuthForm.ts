
import { useCallback } from "react";
import { useFormState } from "./useFormState";
import { useAuthSubmission } from "./useAuthSubmission";

interface UseAuthFormProps {
  isSignUp: boolean;
  onError: (message: string) => void;
}

export function useAuthForm({ isSignUp, onError }: UseAuthFormProps) {
  const { formData, setEmail, setPassword, setName, setCompanyName, setRememberMe } = useFormState();
  const { handleSignIn, handleSignUp, isLoading } = useAuthSubmission({ onError });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await handleSignUp(formData.email, formData.password, formData.name, formData.companyName);
    } else {
      await handleSignIn(formData.email, formData.password, formData.rememberMe);
    }
  }, [isSignUp, handleSignUp, handleSignIn, formData]);

  return {
    // Form data
    email: formData.email,
    setEmail,
    password: formData.password,
    setPassword,
    name: formData.name,
    setName,
    companyName: formData.companyName,
    setCompanyName,
    rememberMe: formData.rememberMe,
    setRememberMe,
    
    // Form state
    isLoading,
    handleSubmit
  };
}
