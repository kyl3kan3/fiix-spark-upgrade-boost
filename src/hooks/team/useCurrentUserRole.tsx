
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentUserRole = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Check current user's role on component mount
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      setIsLoading(true);
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
        console.log("Current user's role:", data?.role);
      } catch (error: any) {
        console.error("Error checking user role:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCurrentUserRole();
  }, []);
  
  return {
    currentUserRole,
    isLoading,
    error,
    canEditRoles: currentUserRole === "administrator"
  };
};
