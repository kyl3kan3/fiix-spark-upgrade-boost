
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
          console.log("No authenticated user found");
          setCurrentUserRole(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Checking role for user ID:", user.id);
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single
          
        if (error) {
          console.error("Supabase error fetching role:", error);
          setCurrentUserRole(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Current user role data:", data);
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
  
  console.log("Current user role:", currentUserRole, "Can edit roles:", canEditRoles);

  return {
    currentUserRole,
    isLoading,
    canEditRoles
  };
};
