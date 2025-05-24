
import { useState, useCallback } from "react";

export function useProfileState() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setSavingState = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
