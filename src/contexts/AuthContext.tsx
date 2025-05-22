
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type User = {
  id: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, userData: { first_name?: string; last_name?: string; company_name?: string }) => 
    Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
          setIsAuthenticated(true);
          
          if (event === 'SIGNED_IN') {
            toast.success("Successfully signed in!");
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          if (event === 'SIGNED_OUT') {
            toast.info("Signed out successfully");
          }
        }
      }
    );

    initAuth();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    userData: { first_name?: string; last_name?: string; company_name?: string }
  ) => {
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
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, signIn, signUp, signOut }}>
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
