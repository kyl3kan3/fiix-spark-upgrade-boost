
// Re-export from the consolidated auth actions hook for backward compatibility
import { useAuthActions } from "../useAuthActions";

export function useSignIn() {
  const { signIn, isSigningIn } = useAuthActions();
  
  return { 
    signIn, 
    isLoading: isSigningIn 
  };
}
