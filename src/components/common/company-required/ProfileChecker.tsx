
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCheckerProps {
  onCompanyFound: (companyId: string) => void;
}

export const ProfileChecker: React.FC<ProfileCheckerProps> = ({ onCompanyFound }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkUserCompanyInDatabase = async () => {
    try {
      setIsRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsRefreshing(false);
        return null;
      }
      
      // Check if profile exists first
      const { data: profileExists, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileCheckError) {
        console.error("Error checking profile existence:", profileCheckError);
      }
      
      // If profile doesn't exist, create it with basic info
      if (!profileExists) {
        console.log("Profile doesn't exist, creating one");
        
        // Get email from user object
        const email = user.email || '';
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: email,
            role: 'technician',
            company_id: '' // Placeholder, will be updated if company found
          });
          
        if (createError) {
          console.error("Error creating profile:", createError);
        }
      }
      
      // Now check for company association
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching user profile:", fetchError);
        setIsRefreshing(false);
        return null;
      }
        
      console.log("Direct database check for profile:", profile);
      
      if (profile?.company_id) {
        // If company_id exists, mark setup as complete
        localStorage.setItem('maintenease_setup_complete', 'true');
        onCompanyFound(profile.company_id);
        setIsRefreshing(false);
        return profile.company_id;
      }
      
      setIsRefreshing(false);
      return null;
    } catch (error) {
      console.error("Error checking user profile directly:", error);
      setIsRefreshing(false);
      return null;
    }
  };

  const handleRefreshCompanyAssociation = async () => {
    try {
      toast.info("Checking company association...");
      
      // Check the database directly
      const companyId = await checkUserCompanyInDatabase();
      
      if (companyId) {
        toast.success("Company association found. Refreshing...");
        onCompanyFound(companyId);
      } else {
        toast.error("No company association found. Please complete setup.");
      }
    } catch (error) {
      console.error("Error checking company association:", error);
      toast.error("Error checking company association");
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleRefreshCompanyAssociation} 
      className="w-full"
      disabled={isRefreshing}
    >
      {isRefreshing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking...
        </>
      ) : (
        <>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Company Association
        </>
      )}
    </Button>
  );
};
