
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSimpleCompanyChecker(onCompanyFound: (companyId: string) => void) {
  const [isChecking, setIsChecking] = useState(false);

  const checkCompanyAssociation = async () => {
    try {
      setIsChecking(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Check user's profile for company association
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking profile:", error);
        toast.error("Failed to check company association");
        return;
      }

      if (profile?.company_id) {
        localStorage.setItem('maintenease_setup_complete', 'true');
        onCompanyFound(profile.company_id);
        toast.success("Company association found!");
      } else {
        toast.info("No company association found");
      }
    } catch (error) {
      console.error("Error checking company:", error);
      toast.error("Failed to check company association");
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    checkCompanyAssociation
  };
}
