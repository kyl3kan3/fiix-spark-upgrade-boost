
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";
import { logger } from "@/lib/logger";

export function useProfileCreation() {
 const [isCreating, setIsCreating] = useState(false);

  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      setIsCreating(true);
      logger.log("Creating initial profile for user:", userId);

      // IMPORTANT: never pick an arbitrary company here. Either the
      // handle_new_user trigger has already created a row, or the user
      // still needs to go through onboarding (which will set company_id
      // through accept_invitation or company creation).
      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: null as string | null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Failed to create initial profile:", error);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

 return {
 createInitialProfile,
 isCreating
 };
}
