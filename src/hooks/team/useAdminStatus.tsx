
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
          .single();
          
        if (error) throw error;

        // Check if user is an administrator
        setIsAdminUser(data?.role === "administrator");
        
        // Fetch company info - handle the case where column may not exist
        try {
          // Use maybeSingle instead to prevent errors if no data is found
          const { data: companyData } = await supabase
            .from('profiles')
            .select('company_name')
            .eq('id', user.id)
            .maybeSingle();
            
          if (companyData && 'company_name' in companyData) {
            setCompanyName(companyData.company_name);
          }
        } catch (companyError) {
          console.error("Error fetching company name:", companyError);
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
