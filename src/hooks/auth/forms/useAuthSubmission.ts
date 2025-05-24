
import { useCallback } from "react";
import { useSignIn } from "@/hooks/auth/actions/useSignIn";
import { useSignUp } from "@/hooks/auth/actions/useSignUp";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

interface UseAuthSubmissionProps {
  onError: (message: string) => void;
}

export function useAuthSubmission({ onError }: UseAuthSubmissionProps) {
  const { signIn, isLoading: isSigningIn } = useSignIn();
  const { signUp, isLoading: isSigningUp } = useSignUp();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignInForm, validateSignUpForm } = useFormValidation();

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

  const handleSignUp = useCallback(async (email: string, password: string, name: string, companyName: string) => {
    const validation = validateSignUpForm(email, password, name, companyName);
    if (!validation.isValid) {
      onError(validation.error!);
      return false;
    }
    
    const result = await signUp(email, password, {
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      company_name: companyName
    });
    
    if (result.success) {
      localStorage.setItem("pending_auth_email", email);
      handleAuthSuccess();
      return true;
    } else if (result.error) {
      onError(result.error);
      return false;
    }
    
    return false;
  }, [signUp, validateSignUpForm, onError, handleAuthSuccess]);

  return {
    handleSignIn,
    handleSignUp,
    isLoading: isSigningIn || isSigningUp
  };
}
