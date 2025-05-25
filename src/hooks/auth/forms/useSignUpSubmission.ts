
// Re-export from the consolidated auth submission hook for backward compatibility
import { useAuthSubmission } from "./useAuthSubmission";

interface UseSignUpSubmissionProps {
  onError: (message: string) => void;
}

export function useSignUpSubmission({ onError }: UseSignUpSubmissionProps) {
  const { handleSignUp, isLoading } = useAuthSubmission({ onError });
  
  return { 
    handleSignUp, 
    isLoading 
  };
}
