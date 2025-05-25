
// Re-export from the consolidated auth state hook for backward compatibility
import { useAuthState } from "./useAuthState";

export function useAuthErrorHandler() {
  const { error, handleError, clearError } = useAuthState();
  
  return {
    error,
    handleError,
    clearError
  };
}
