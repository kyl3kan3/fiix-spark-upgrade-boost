
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/authErrors";

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);

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

  return { signOut, isLoading };
}
