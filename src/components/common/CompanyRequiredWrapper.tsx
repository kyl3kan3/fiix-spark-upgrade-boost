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

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const { profileData, isLoading: profileLoading, error: profileError } = useUserProfile(['role', 'company_id']);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if setup is completed from both local storage and database
    const checkSetupStatus = async () => {
      try {
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
  }, []);

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

  // If setup is explicitly marked as complete, allow access
  if (setupComplete === true) {
    console.log("Setup is marked as complete, allowing access");
    return <>{children}</>;
  }

  // If we have company_id, still allow access
  // This handles cases where the company was created but setup wasn't marked complete
  if (profileData?.company_id) {
    console.log("Company ID exists, allowing access");
    return <>{children}</>;
  }

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

        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/setup')} 
            className="w-full"
          >
            Complete Company Setup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyRequiredWrapper;
