
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null; session: Session | null }>;
  signUp: (email: string, password: string, userData: { first_name?: string; last_name?: string; company_name?: string }) => 
    Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ success: boolean; error: string | null; session: Session | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state and set up listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession?.user);
        
        if (event === 'SIGNED_IN' && newSession) {
          toast.success("Successfully signed in!");
        } else if (event === 'SIGNED_OUT') {
          toast.info("Signed out successfully");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Auth token refreshed");
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message, session: null };
      }

      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message, session: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    userData: { first_name?: string; last_name?: string; company_name?: string }
  ) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast.info("Check your email for the confirmation link");
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsSubmitting(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    setIsSubmitting(true);
    try {
      console.log("Manually refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        return { success: false, error: error.message, session: null };
      }
      
      console.log("Session refreshed successfully");
      return { success: true, error: null, session: data.session };
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      return { success: false, error: error.message, session: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isLoading,
      isSubmitting,
      isAuthenticated, 
      signIn, 
      signUp, 
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
