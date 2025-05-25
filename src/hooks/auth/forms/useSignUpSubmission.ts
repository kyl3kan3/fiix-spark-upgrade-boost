
import { useCallback } from "react";
import { useSignUp } from "@/hooks/auth/actions/useSignUp";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useAuthValidation } from "@/hooks/auth/validation/useAuthValidation";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";
import { parseFullName } from "@/utils/formUtils";
import { setStorageItem } from "@/utils/storageUtils";

interface UseSignUpSubmissionProps {
  onError: (message: string) => void;
}

export function useSignUpSubmission({ onError }: UseSignUpSubmissionProps) {
  const { signUp, isLoading } = useSignUp();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignUpForm } = useAuthValidation();

  const handleSignUp = useCallback(async (email: string, password: string, name: string, companyName: string) => {
    const validation = validateSignUpForm(email, password, name, companyName);
    if (!validation.isValid) {
      onError(validation.error!);
      return false;
    }
    
    const { firstName, lastName } = parseFullName(name);
    
    const result = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      company_name: companyName
    });
    
    if (result.success) {
      setStorageItem(AUTH_STORAGE_KEYS.PENDING_EMAIL, email);
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
