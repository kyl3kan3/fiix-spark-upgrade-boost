
// Re-export from the new consolidated hook for backward compatibility
import { useAuthForm } from "../../../../hooks/auth/forms/useAuthForm";

export function useSignInForm(onError: (message: string) => void) {
  return useAuthForm({ isSignUp: false, onError });
}
