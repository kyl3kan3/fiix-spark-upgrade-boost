
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentUserRole = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      try {
        setIsLoading(true);
        
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
        setCurrentUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCurrentUserRole();
  }, []);
  
  // Determine if the current user can edit roles (only administrators can)
  const canEditRoles = currentUserRole === 'administrator';

  return {
    currentUserRole,
    isLoading,
    canEditRoles
  };
};
