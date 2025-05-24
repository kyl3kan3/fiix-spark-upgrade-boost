
import { useState, useCallback } from "react";
import { useFormState } from "@/hooks/auth/forms/useFormState";
import { useSignUpSubmission } from "@/hooks/auth/forms/useSignUpSubmission";

export function useSignUpForm(onError: (message: string) => void) {
  const { formData, setEmail, setPassword, setName, setCompanyName } = useFormState();
  const { handleSignUp, isLoading } = useSignUpSubmission({ onError });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp(formData.email, formData.password, formData.name, formData.companyName);
  }, [handleSignUp, formData]);

  return {
    email: formData.email,
    setEmail,
    password: formData.password,
    setPassword,
    name: formData.name,
    setName,
    companyName: formData.companyName,
    setCompanyName,
    isLoading,
    handleSubmit
  };
}
