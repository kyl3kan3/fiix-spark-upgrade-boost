
import { useCallback } from "react";
import { useSignUp } from "@/hooks/auth/actions/useSignUp";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

interface UseSignUpSubmissionProps {
  onError: (message: string) => void;
}

export function useSignUpSubmission({ onError }: UseSignUpSubmissionProps) {
  const { signUp, isLoading } = useSignUp();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignUpForm } = useFormValidation();

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
    handleSignUp,
    isLoading
  };
}
