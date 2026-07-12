import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export const useUserProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Company/role assignment is owned by the onboarding and invitation RPCs.
  // This legacy hook now verifies the result without attempting escalation.
  const checkAndFixUserProfile = async (companyId: string) => {
    if (!userId) return false;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }

    const matches = profile?.company_id === companyId;
    if (!matches) logger.warn("Profile company did not match the saved company");
    return matches;
  };

  return { userId, checkAndFixUserProfile };
};
