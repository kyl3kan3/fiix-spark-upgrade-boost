
import { useState } from "react";

interface ProfileState {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export function useProfileState() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLoadingState = (loading: boolean) => setIsLoading(loading);
  const setSavingState = (saving: boolean) => setIsSaving(saving);
  const setErrorState = (error: string | null) => setError(error);
  const clearError = () => setError(null);

  return {
    isLoading,
    isSaving,
    error,
    setLoadingState,
    setSavingState,
    setErrorState,
    clearError
  };
}
