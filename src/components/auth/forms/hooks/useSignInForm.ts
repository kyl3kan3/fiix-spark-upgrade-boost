
import { useState, useCallback } from "react";
import { useFormState } from "@/hooks/auth/forms/useFormState";
import { useSignInSubmission } from "@/hooks/auth/forms/useSignInSubmission";

export function useSignInForm(onError: (message: string) => void) {
  const { formData, setEmail, setPassword, setRememberMe } = useFormState();
  const { handleSignIn, isLoading } = useSignInSubmission({ onError });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn(formData.email, formData.password, formData.rememberMe);
  }, [handleSignIn, formData]);

  return {
    email: formData.email,
    setEmail,
    password: formData.password,
    setPassword,
    rememberMe: formData.rememberMe,
    setRememberMe,
    isLoading,
    handleSubmit
  };
}
