
import React from "react";
import { Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ProfileChecker } from "./ProfileChecker";
import { AdminFixer } from "./AdminFixer";
import CompanySetupButton from "../../setup/company/CompanySetupButton";

interface SetupRequiredDisplayProps {
  profileError: Error | null;
  onCompanyFound: (companyId: string) => void;
  onProfileFixed: () => void;
}

export const SetupRequiredDisplay: React.FC<SetupRequiredDisplayProps> = ({
  profileError,
  onCompanyFound,
  onProfileFixed
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mb-4">
            <Building2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Company Setup Required</h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            You need to complete your company setup before accessing the application.
          </p>
        </div>

        {profileError && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {profileError.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <CompanySetupButton />
          
          <ProfileChecker onCompanyFound={onCompanyFound} />
          
          <AdminFixer onProfileFixed={onProfileFixed} />
        </div>
      </div>
    </div>
  );
};
