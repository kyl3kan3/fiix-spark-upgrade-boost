import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  handleError: (message: string) => void;
  clearError: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const marketingAuthStub: AuthContextType = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  handleError: () => undefined,
  clearError: () => undefined,
  logout: async () => undefined,
};

/** App/protected routes: holds ProtectedRoute in a loading state until live auth loads. */
export const marketingAuthLoadingStub: AuthContextType = {
  ...marketingAuthStub,
  isLoading: true,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};