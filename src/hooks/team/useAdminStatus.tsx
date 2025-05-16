
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStatusResult {
  isAdminUser: boolean;
  companyName: string | undefined;
  isLoading: boolean;
  error: string | null;
}

export const useAdminStatus = (): AdminStatusResult => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdminUser(false);
          setIsLoading(false);
          return;
        }
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to prevent errors
          
        if (error) {
          console.error("Error fetching profile:", error);
          setError("Could not verify your permissions");
          setIsLoading(false);
          return;
        }

        // Check if user is an administrator
        setIsAdminUser(data?.role === "administrator");
        console.log("Admin status check: User role is", data?.role);
        
        // Make a separate query for company_name to handle the case where it might not exist yet
        try {
          const { data: companyData, error: companyError } = await supabase
            .from('profiles')
            .select('company_name')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!companyError && companyData && 'company_name' in companyData) {
            setCompanyName(companyData.company_name as string | undefined);
          }
        } catch (err) {
          console.error("Could not fetch company name:", err);
          // Don't set an error here, just log it and continue
        }
      } catch (err: any) {
        console.error("Error checking admin status:", err);
        setError("Could not verify your permissions");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  return {
    isAdminUser,
    companyName,
    isLoading,
    error
  };
};
