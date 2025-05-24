
import { useState } from "react";
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

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
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
      const message = error.message || "An unexpected error occurred";
      toast.error("Sign in failed", { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: SignUpData
  ): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) {
        toast.error("Sign up failed", { description: error.message });
        return { success: false, error: error.message };
      }

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "An unexpected error occurred";
      toast.error("Sign up failed", { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Sign out failed", { description: error.message });
        return { success: false, error: error.message };
      }

      toast.info("You have been signed out");
      return { success: true };
    } catch (error: any) {
      const message = error.message || "An unexpected error occurred";
      toast.error("Sign out failed", { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading
  };
}
