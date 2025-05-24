
import React from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyChecker } from "./hooks/useCompanyChecker";

interface ProfileCheckerProps {
  onCompanyFound: (companyId: string) => void;
}

export const ProfileChecker: React.FC<ProfileCheckerProps> = ({ onCompanyFound }) => {
  const { isRefreshing, handleRefreshCompanyAssociation } = useCompanyChecker(onCompanyFound);

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
