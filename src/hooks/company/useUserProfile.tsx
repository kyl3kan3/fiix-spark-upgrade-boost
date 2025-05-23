
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
      // Check current profile - use maybeSingle() to handle case where profile doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
        return false;
      }
      
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
          
          // If RLS error, try a workaround by having the user sign out and back in
          if (updateError.message.includes("violates row-level security policy")) {
            console.log("Detected RLS error, will try refreshing auth session");
            
            // Try to refresh the session
            const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error("Failed to refresh session:", refreshError);
              return false;
            }
            
            if (sessionData.session) {
              console.log("Session refreshed, trying profile update again");
              
              // Try update again after session refresh
              const { error: retryError } = await supabase
                .from("profiles")
                .upsert({
                  id: userId,
                  company_id: companyId,
                  role: "administrator",
                  email: email
                });
              
              if (retryError) {
                console.error("Error on second profile update attempt:", retryError);
                return false;
              }
              
              return true;
            }
          }
          
          return false;
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
