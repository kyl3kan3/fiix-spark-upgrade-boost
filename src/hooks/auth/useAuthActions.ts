
import { useSignIn } from "./actions/useSignIn";
import { useSignUp } from "./actions/useSignUp";
import { useSignOut } from "./actions/useSignOut";

export function useAuthActions() {
  const { signIn, isLoading: isSigningIn } = useSignIn();
  const { signUp, isLoading: isSigningUp } = useSignUp();
  const { signOut, isLoading: isSigningOut } = useSignOut();

  const isLoading = isSigningIn || isSigningUp || isSigningOut;

  return {
    signIn,
    signUp,
    signOut,
    isLoading
  };
}
