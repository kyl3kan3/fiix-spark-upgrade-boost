
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignUpData {
 first_name?: string;
 last_name?: string;
 company_name?: string;
}

interface AuthResult {
 success: boolean;
 error?: string;
}

export function useAuthOperations() {
 const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
 try {
 const { error } = await supabase.auth.signInWithPassword({
 email,
 password,
 });

 if (error) {
 toast.error("Sign in failed", { description: error.message });
 return { success: false, error: error.message };
 }

 toast.success("Welcome back!");
 return { success: true };
 } catch (error: any) {
 const errorMessage = error.message || "An unexpected error occurred";
 toast.error("Sign in failed", { description: errorMessage });
 return { success: false, error: errorMessage };
 }
 }, []);

 const signUp = useCallback(async (email: string, password: string, userData?: SignUpData): Promise<AuthResult> => {
 try {
       const hasPendingInvite =
        typeof window !== "undefined" &&
        !!localStorage.getItem("pending_invite_token");
      const redirectPath = hasPendingInvite ? "/onboarding" : "/";
  const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: userData || {},
          emailRedirectTo: `${window.location.origin}${redirectPath}`
 }
 });

 if (error) {
 toast.error("Sign up failed", { description: error.message });
 return { success: false, error: error.message };
 }

        // Supabase returns success with an empty identities array when the
        // email is already registered (to prevent email enumeration). Detect
        // that case and tell the user to sign in instead — otherwise they
        // sit waiting for a verification email that will never arrive.
        const identities = (data?.user as any)?.identities;
        if (Array.isArray(identities) && identities.length === 0) {
          const msg = hasPendingInvite
            ? "An account with this email already exists. Please sign in to accept your invitation."
            : "An account with this email already exists. Please sign in instead.";
          toast.error("Account already exists", { description: msg });
          return { success: false, error: msg };
        }

 toast.success("Account created successfully!");
 return { success: true };
 } catch (error: any) {
 const errorMessage = error.message || "An unexpected error occurred";
 toast.error("Sign up failed", { description: errorMessage });
 return { success: false, error: errorMessage };
 }
 }, []);

 const signOut = useCallback(async (): Promise<AuthResult> => {
 try {
 const { error } = await supabase.auth.signOut();
 
 if (error) {
 toast.error("Sign out failed", { description: error.message });
 return { success: false, error: error.message };
 }

 toast.success("Signed out successfully");
 return { success: true };
 } catch (error: any) {
 const errorMessage = error.message || "An unexpected error occurred";
 toast.error("Sign out failed", { description: errorMessage });
 return { success: false, error: errorMessage };
 }
 }, []);

 return {
 signIn,
 signUp,
 signOut
 };
}
