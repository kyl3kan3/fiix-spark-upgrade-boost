
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log(`Auth state change: ${event}`, currentSession?.user?.id);
          
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsAuthenticated(!!currentSession?.user);
          }
          
          if (event === 'SIGNED_IN') {
            console.log("User signed in:", currentSession?.user.id);
            toast.success("Successfully signed in!");
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            toast.info("Signed out");
          }
        });
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (mounted) {
          const authenticated = !!data.session;
          setIsAuthenticated(authenticated);
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          console.log(
            authenticated 
              ? `Auth initialized with session for user: ${data.session.user.id}` 
              : "Auth initialized with no active session"
          );
        }
        
      } catch (err) {
        console.error("Error checking auth status:", err);
        if (mounted) {
          setIsAuthenticated(false);
          setAuthError(err instanceof Error ? err.message : "Unknown authentication error");
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
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
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
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
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setIsAuthenticated(false);
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
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
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
    authError,
    user,
    session,
    signIn,
    signUp,
    signOut
  };
};
