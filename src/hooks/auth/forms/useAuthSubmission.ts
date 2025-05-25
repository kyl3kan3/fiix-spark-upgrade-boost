
import { useCallback } from "react";
import { useAuthActions } from "../useAuthActions";
import { useAuthValidation } from "../validation/useAuthValidation";
import { useAuthNavigation } from "../useAuthNavigation";

interface UseAuthSubmissionProps {
  onError: (message: string) => void;
}

export function useAuthSubmission({ onError }: UseAuthSubmissionProps) {
  const { signIn, signUp, isSigningIn, isSigningUp } = useAuthActions();
  const { validateSignInForm, validateSignUpForm } = useAuthValidation();
  const { handleAuthSuccess } = useAuthNavigation();

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    // Validate form data
    const validation = validateSignInForm(email, password);
    if (!validation.isValid) {
      onError(validation.error || "Invalid form data");
      return;
    }

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        handleAuthSuccess();
      } else if (result.error) {
        onError(result.error);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred during sign in");
    }
  }, [signIn, validateSignInForm, handleAuthSuccess, onError]);

  const handleSignUp = useCallback(async (email: string, password: string, name: string, companyName: string) => {
    // Validate form data
    const validation = validateSignUpForm(email, password, name, companyName);
    if (!validation.isValid) {
      onError(validation.error || "Invalid form data");
      return;
    }

    try {
      // Parse the name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName
      };

      const result = await signUp(email, password, userData);
      
      if (result.success) {
        handleAuthSuccess();
      } else if (result.error) {
        onError(result.error);
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred during sign up");
    }
  }, [signUp, validateSignUpForm, handleAuthSuccess, onError]);

  return {
    handleSignIn,
    handleSignUp,
    isLoading: isSigningIn || isSigningUp
  };
}
