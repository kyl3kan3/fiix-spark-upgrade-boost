
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session && !error);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id ? "authenticated" : "unauthenticated");
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      console.log("Attempting to sign in with:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data.session ? "Session exists" : "No session");
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
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage, session: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, companyName: string = "") => {
    setIsSubmitting(true);
    try {
      // Require a company name for all new sign-ups
      if (!companyName) {
        toast.error("Company name is required");
        return { success: false, error: "Company name is required" };
      }

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
        toast.info("This email is already registered. Please sign in instead.");
        return { success: false, error: "This email is already registered" };
      } else {
        // Store company name for use during onboarding
        if (companyName) {
          localStorage.setItem("pending_company_name", companyName);
        }
        
        localStorage.setItem("pending_auth_email", email);
        
        toast.success("Account created successfully! Please check your email for verification.");
        return { success: true, error: null };
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = "Failed to create account: " + error.message;
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

  return {
    isSubmitting,
    isAuthenticated,
    signIn,
    signUp,
    signOut
  };
};
