
// Re-export from the consolidated auth actions hook for backward compatibility
import { useAuthActions } from "../useAuthActions";

interface SignUpData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export function useSignUp() {
  const { signUp, isSigningUp } = useAuthActions();
  
  return { 
    signUp, 
    isLoading: isSigningUp 
  };
}
