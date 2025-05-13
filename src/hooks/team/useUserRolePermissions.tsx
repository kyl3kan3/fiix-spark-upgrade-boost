
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRolePermissions = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Not authenticated");
        }
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setCurrentUserRole(data?.role || null);
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    checkCurrentUserRole();
  }, []);

  return {
    currentUserRole,
    checkingPermissions,
    isAdmin: currentUserRole === 'administrator'
  };
};
