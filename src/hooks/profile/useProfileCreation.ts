
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";

export function useProfileCreation() {
  const [isCreating, setIsCreating] = useState(false);

  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      setIsCreating(true);
      console.log("Creating initial profile for user:", userId);
      
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();

      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: companyData?.id || null,
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone_number: null,
        company_name: null
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
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
