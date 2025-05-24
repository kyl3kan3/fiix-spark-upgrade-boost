
import React from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimpleCompanyChecker } from "@/hooks/company/useSimpleCompanyChecker";

interface ProfileCheckerProps {
  onCompanyFound: (companyId: string) => void;
}

export const ProfileChecker: React.FC<ProfileCheckerProps> = ({ onCompanyFound }) => {
  const { isChecking, checkCompanyAssociation } = useSimpleCompanyChecker(onCompanyFound);

  return (
    <Button 
      variant="outline"
      onClick={checkCompanyAssociation} 
      className="w-full"
      disabled={isChecking}
    >
      {isChecking ? (
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
