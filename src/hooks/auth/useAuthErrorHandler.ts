
import { toast } from "sonner";
import { getErrorMessage, isAuthError } from "@/utils/authErrors";
import { useErrorState } from "./state/useErrorState";

export function useAuthErrorHandler() {
  const { error, showError, clearError } = useErrorState();

  const handleError = (error: any) => {
    if (!isAuthError(error)) {
      console.warn("Invalid error passed to handleError:", error);
      return;
    }

    const message = getErrorMessage(error);
    showError(message);
    toast.error("Authentication Error", { description: message });
  };

  return {
    error,
    handleError,
    clearError
  };
}
