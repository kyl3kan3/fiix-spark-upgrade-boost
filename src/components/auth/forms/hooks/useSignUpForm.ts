
// Re-export from the new consolidated hook for backward compatibility
import { useAuthForm } from "../../../../hooks/auth/forms/useAuthForm";

export function useSignUpForm(onError: (message: string) => void) {
  return useAuthForm({ isSignUp: true, onError });
}
