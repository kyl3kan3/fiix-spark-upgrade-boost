
// Re-export from the consolidated auth submission hook for backward compatibility
import { useAuthSubmission } from "./useAuthSubmission";

interface UseSignInSubmissionProps {
  onError: (message: string) => void;
}

export function useSignInSubmission({ onError }: UseSignInSubmissionProps) {
  const { handleSignIn, isLoading } = useAuthSubmission({ onError });
  
  return { 
    handleSignIn, 
    isLoading 
  };
}
