
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/authErrors";

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
        const errorMessage = getErrorMessage(error);
        toast.error("Sign in failed", { description: errorMessage });
        return { success: false, error: errorMessage };
      }

      toast.success("Welcome back!");
      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error("Sign in failed", { description: errorMessage });
      return { success: false, error: errorMessage };
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
        const errorMessage = getErrorMessage(error);
        toast.error("Sign up failed", { description: errorMessage });
        return { success: false, error: errorMessage };
      }

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error("Sign up failed", { description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const errorMessage = getErrorMessage(error);
        toast.error("Sign out failed", { description: errorMessage });
        return { success: false, error: errorMessage };
      }

      toast.info("You have been signed out");
      return { success: true };
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error("Sign out failed", { description: errorMessage });
      return { success: false, error: errorMessage };
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
