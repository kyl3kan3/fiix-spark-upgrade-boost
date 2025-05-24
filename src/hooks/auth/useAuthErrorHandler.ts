
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getErrorMessage, isAuthError } from "@/utils/authErrors";

export function useAuthErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    if (!isAuthError(error)) {
      console.warn("Invalid error passed to handleError:", error);
      return;
    }

    const message = getErrorMessage(error);
    setError(message);
    toast.error("Authentication Error", { description: message });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}
