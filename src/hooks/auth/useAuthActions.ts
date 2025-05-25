
import { useState, useCallback } from "react";
import { useAuthOperations } from "./core/useAuthOperations";

interface SignUpData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export function useAuthActions() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signIn: performSignIn, signUp: performSignUp, signOut: performSignOut } = useAuthOperations();

  const signIn = useCallback(async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      return await performSignIn(email, password);
    } finally {
      setIsSigningIn(false);
    }
  }, [performSignIn]);

  const signUp = useCallback(async (email: string, password: string, userData?: SignUpData) => {
    setIsSigningUp(true);
    try {
      return await performSignUp(email, password, userData);
    } finally {
      setIsSigningUp(false);
    }
  }, [performSignUp]);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      return await performSignOut();
    } finally {
      setIsSigningOut(false);
    }
  }, [performSignOut]);

  const isLoading = isSigningIn || isSigningUp || isSigningOut;

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    isSigningIn,
    isSigningUp,
    isSigningOut
  };
}
