
import { useState } from "react";

export function useErrorState() {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    showError,
    clearError
  };
}
