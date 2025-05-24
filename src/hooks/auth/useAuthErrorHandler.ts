
import { useState } from "react";
import { toast } from "sonner";

export function useAuthErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string) => {
    setError(message);
    toast.error("Authentication Error", { description: message });
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError
  };
}
