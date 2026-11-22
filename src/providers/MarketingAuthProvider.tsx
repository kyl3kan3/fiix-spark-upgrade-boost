import type { ReactNode } from "react";
import { AuthContext, marketingAuthStub } from "@/providers/authContextShared";

/** Indexable marketing routes: auth context stub without loading Supabase. */
export function MarketingAuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={marketingAuthStub}>{children}</AuthContext.Provider>;
}