
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserData = (setFullName: (name: string) => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Populate user data from auth
  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw new Error(`Auth error: ${authError.message}`);
        }

        if (user?.user_metadata) {
          const firstName = user.user_metadata.first_name || '';
          const lastName = user.user_metadata.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          if (fullName) {
            setFullName(fullName);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error fetching user data"));
        toast.error("Failed to load user data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserData();
  }, [setFullName]);

  return { isLoading, error };
};
