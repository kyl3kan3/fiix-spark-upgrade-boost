
// Re-export from the consolidated auth actions hook for backward compatibility
import { useAuthActions } from "../useAuthActions";

export function useSignUp() {
  const { signUp, isSigningUp } = useAuthActions();
  
  return { 
    signUp, 
    isLoading: isSigningUp 
  };
}
