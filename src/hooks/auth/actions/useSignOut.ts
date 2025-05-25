
// Re-export from the consolidated auth actions hook for backward compatibility
import { useAuthActions } from "../useAuthActions";

export function useSignOut() {
  const { signOut, isSigningOut } = useAuthActions();
  
  return { 
    signOut, 
    isLoading: isSigningOut 
  };
}
