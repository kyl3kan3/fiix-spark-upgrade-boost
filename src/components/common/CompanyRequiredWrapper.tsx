import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/team/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { isSetupCompleted } from "@/services/setup";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const { profileData, isLoading: profileLoading, error: profileError } = useUserProfile(['role', 'company_id']);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const navigate = useNavigate();

  // Function to directly check the user's profile in the database
  const checkUserCompanyInDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .maybeSingle();
        
      console.log("Direct database check for profile:", profile);
      
      if (profile?.company_id) {
        // If company_id exists, mark setup as complete
        localStorage.setItem('maintenease_setup_complete', 'true');
        return profile.company_id;
      }
      
      return null;
    } catch (error) {
      console.error("Error checking user profile directly:", error);
      return null;
    }
  };

  // Effect to check for user profile changes
  useEffect(() => {
    const checkCompanyProfileLink = async () => {
      if (profileData?.company_id) {
        setSetupComplete(true);
        localStorage.setItem('maintenease_setup_complete', 'true');
        setIsLoading(false);
        return;
      }
      
      // If no company_id in profile data, check database directly as fallback
      const companyId = await checkUserCompanyInDatabase();
      if (companyId) {
        setSetupComplete(true);
        setIsLoading(false);
        // Force a refresh to update profile data
        setForceRefresh(prev => prev + 1);
        return;
      }

      // Only check setup status if we don't have a company_id
      const checkSetupStatus = async () => {
        try {
          // First check localStorage for immediate result
          const localSetupComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
          
          // If localStorage indicates complete, use that result immediately
          if (localSetupComplete) {
            setSetupComplete(true);
            setIsLoading(false);
            return;
          }
          
          // Otherwise check database (this will also update localStorage if needed)
          const isComplete = await isSetupCompleted();
          setSetupComplete(isComplete);
          console.log("Setup completed status:", isComplete);
        } catch (error) {
          console.error("Error checking setup completion:", error);
          setSetupComplete(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkSetupStatus();
    };

    checkCompanyProfileLink();
  }, [profileData, forceRefresh]);

  // Wait for both profile data and setup check to complete
  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-maintenease-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Debug log to help track the issue
  console.log("CompanyRequiredWrapper state:", { 
    setupComplete, 
    hasCompanyId: !!profileData?.company_id, 
    company_id: profileData?.company_id,
    forceRefresh
  });

  // If we have a company_id, always allow access
  if (profileData?.company_id) {
    console.log("Company ID exists, allowing access");
    
    // Auto-mark setup as complete if we have a company ID
    localStorage.setItem('maintenease_setup_complete', 'true');
    
    return <>{children}</>;
  }

  // If setup is explicitly marked as complete, allow access
  if (setupComplete === true) {
    console.log("Setup is marked as complete, allowing access");
    return <>{children}</>;
  }

  // Add a button to check company association directly
  const handleCheckCompanyAssociation = async () => {
    try {
      toast.info("Checking company association...");
      
      // Check the database directly
      const companyId = await checkUserCompanyInDatabase();
      
      if (companyId) {
        toast.success("Company association found. Refreshing...");
        // Force refresh the component
        setForceRefresh(prev => prev + 1);
      } else {
        toast.error("No company association found. Please complete setup.");
      }
    } catch (error) {
      console.error("Error checking company association:", error);
      toast.error("Error checking company association");
    }
  };

  // Otherwise show the setup required page
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-amber-100 p-3 mb-4">
            <Building2 className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Company Setup Required</h1>
          <p className="mt-2 text-center text-gray-600">
            You need to complete your company setup before accessing the application.
          </p>
        </div>

        {profileError && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <AlertDescription className="text-red-700">
              {profileError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/setup')} 
            className="w-full"
          >
            Complete Company Setup
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleCheckCompanyAssociation} 
            className="w-full"
          >
            Check Company Association
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyRequiredWrapper;
