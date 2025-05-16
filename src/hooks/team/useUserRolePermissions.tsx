
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
          console.log("No authenticated user found");
          setCurrentUserRole(null);
          setCheckingPermissions(false);
          return;
        }
        
        console.log("Checking permissions for user ID:", user.id);
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single
          
        if (error) {
          console.error("Error checking permissions:", error);
          setCurrentUserRole(null);
          setCheckingPermissions(false);
          return;
        }
        
        console.log("User permissions data:", data);
        setCurrentUserRole(data?.role || null);
      } catch (error) {
        console.error("Error checking user role:", error);
        setCurrentUserRole(null);
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
