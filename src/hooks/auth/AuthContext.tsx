
import { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthOperations } from "./useAuthOperations";

interface AuthContextType {
  isSubmitting: boolean;
  isAuthenticated: boolean | null;
  authError: string | null;
  user: any;
  session: any;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: string | null;
    session: any;
  }>;
  signUp: (email: string, password: string, name: string, companyName?: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signOut: () => Promise<{
    success: boolean;
    error: string | null;
  }>;
  refreshSession: () => Promise<{
    success: boolean;
    error: string | null;
    session: any;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, session, authError, setAuthError } = useAuthState();
  const { isSubmitting, signIn, signUp, signOut, refreshSession } = useAuthOperations(setAuthError);

  const value = {
    isSubmitting,
    isAuthenticated,
    authError,
    user,
    session,
    signIn,
    signUp,
    signOut,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
