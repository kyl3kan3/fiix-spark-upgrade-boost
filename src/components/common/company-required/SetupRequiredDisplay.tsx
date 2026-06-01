
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
 <div className="flex items-center justify-center min-h-screen bg-muted p-4 transition-colors">
 <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
 <div className="mb-6 flex flex-col items-center">
 <div className="rounded-full bg-warning/10 dark:bg-warning/30 p-3 mb-4">
 <Building2 className="h-8 w-8 text-warning dark:text-warning" />
 </div>
 <h1 className="text-2xl font-bold text-center text-foreground">Company Setup Required</h1>
 <p className="mt-2 text-center text-foreground">
 You need to complete your company setup before accessing the application.
 </p>
 </div>

 {profileError && (
 <Alert className="mb-6 bg-destructive/10 dark:bg-destructive/20 border-destructive/30 dark:border-destructive">
 <AlertTriangle className="h-4 w-4 text-destructive dark:text-destructive mr-2" />
 <AlertDescription className="text-destructive dark:text-destructive">
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
