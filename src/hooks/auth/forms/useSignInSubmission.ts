
import { useCallback } from "react";
import { useSignIn } from "@/hooks/auth/actions/useSignIn";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

interface UseSignInSubmissionProps {
  onError: (message: string) => void;
}

export function useSignInSubmission({ onError }: UseSignInSubmissionProps) {
  const { signIn, isLoading } = useSignIn();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignInForm } = useFormValidation();

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const validation = validateSignInForm(email, password);
    if (!validation.isValid) {
      onError(validation.error!);
      return false;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem("auth_remember_me", "true");
      } else {
        localStorage.removeItem("auth_remember_me");
      }
      handleAuthSuccess();
      return true;
    } else if (result.error) {
      onError(result.error);
      return false;
    }
    
    return false;
  }, [signIn, validateSignInForm, onError, handleAuthSuccess]);

  return {
    handleSignIn,
    isLoading
  };
}
