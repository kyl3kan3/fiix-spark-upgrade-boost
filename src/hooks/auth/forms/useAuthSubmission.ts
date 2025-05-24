
import { useSignInSubmission } from "./useSignInSubmission";
import { useSignUpSubmission } from "./useSignUpSubmission";

interface UseAuthSubmissionProps {
  onError: (message: string) => void;
}

export function useAuthSubmission({ onError }: UseAuthSubmissionProps) {
  const { handleSignIn, isLoading: isSigningIn } = useSignInSubmission({ onError });
  const { handleSignUp, isLoading: isSigningUp } = useSignUpSubmission({ onError });

  const isLoading = isSigningIn || isSigningUp;

  return {
    handleSignIn,
    handleSignUp,
    isLoading
  };
}
