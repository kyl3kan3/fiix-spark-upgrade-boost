
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for authentication operations (sign in, sign up, sign out)
 */
export const useAuthOperations = (setAuthError: (error: string | null) => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async (email: string, password: string) => {
    console.log("Starting sign in process...");
    setIsSubmitting(true);
    setAuthError(null);
    try {
      console.log("Attempting to sign in with:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data.session ? "Session exists" : "No session");
      
      if (data.session) {
        console.log("User ID:", data.session.user.id);
        console.log("Session expiry:", new Date(data.session.expires_at! * 1000));
        
        // Clear any previous auth errors in localStorage
        localStorage.removeItem("auth_error");
        
        // Store email for future use
        localStorage.setItem("last_email", email);
      }
      
      toast.success("Logged in successfully!");
      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Better error messaging
      let errorMessage = "Authentication failed";
      
      if (error.message.includes("invalid_credentials") || error.message.includes("Invalid login")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before signing in";
      }
      
      // Store the error in localStorage for debugging
      localStorage.setItem("auth_error", errorMessage);
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage, session: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, companyName: string = "") => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // Require a company name for all new sign-ups
      if (!companyName) {
        const errorMsg = "Company name is required";
        toast.error(errorMsg);
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log("Attempting to sign up with:", { email, name, companyName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' '),
            company_name: companyName
          }
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        const msg = "This email is already registered. Please sign in instead.";
        toast.info(msg);
        setAuthError(msg);
        return { success: false, error: msg };
      } else {
        // Store company name for use during onboarding
        if (companyName) {
          localStorage.setItem("pending_company_name", companyName);
        }
        
        localStorage.setItem("pending_auth_email", email);
        localStorage.setItem("last_email", email);
        
        toast.success("Account created successfully! Please check your email for verification.");
        return { success: true, error: null };
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = "Failed to create account: " + error.message;
      setAuthError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      return { success: false, error: error.message };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      return { success: false, error: error.message, session: null };
    }
  };

  return {
    isSubmitting,
    signIn,
    signUp,
    signOut,
    refreshSession
  };
};
