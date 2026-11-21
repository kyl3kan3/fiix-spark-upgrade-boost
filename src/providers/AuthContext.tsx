
import type { ReactNode } from "react";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { AuthContext } from "@/providers/authContextShared";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export { useAuth } from "@/providers/authContextShared";
export { AuthContext };