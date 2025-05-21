
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (setFullName: (name: string) => void) => {
  // Populate user data from auth
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const firstName = user.user_metadata.first_name || '';
        const lastName = user.user_metadata.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (fullName) {
          setFullName(fullName);
        }
      }
    };
    
    getUserData();
  }, [setFullName]);
};
