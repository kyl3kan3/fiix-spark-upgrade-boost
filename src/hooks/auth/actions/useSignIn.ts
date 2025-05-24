
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/authErrors";

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useSignIn() {
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

  return { signIn, isLoading };
}
