
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log("Current user ID:", user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Check and fix user profile if needed
  const checkAndFixUserProfile = async (companyId: string) => {
    if (!userId) return false;
    
    try {
      // Check current profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", userId)
        .maybeSingle();
      
      console.log("Current user profile:", profile);
      
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || '';
      
      // If profile doesn't exist or company_id is not set
      if (!profile || !profile.company_id) {
        console.log("Fixing user profile - setting company_id and role");
        
        // Try to update/create profile
        const { error: updateError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            company_id: companyId,
            role: "administrator",
            email: email
          });
        
        if (updateError) {
          console.error("Error fixing user profile:", updateError);
          throw updateError;
        } else {
          console.log("User profile fixed successfully");
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error checking/fixing user profile:", error);
      return false;
    }
  };

  return { userId, checkAndFixUserProfile };
};
