
import { useState, useCallback } from "react";

export function useErrorState() {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasError = error !== null;

  return {
    error,
    hasError,
    showError,
    clearError
  };
}
