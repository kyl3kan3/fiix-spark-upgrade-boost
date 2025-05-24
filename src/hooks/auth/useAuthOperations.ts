
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthOperations() {
  const signIn = useCallback(async (email: string, password: string) => {
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

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
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
      const errorMessage = error.message || "An unexpected error occurred";
      toast.error("Sign up failed", { description: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
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
