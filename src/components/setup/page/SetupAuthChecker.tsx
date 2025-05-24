
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const SetupAuthChecker: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle>Checking authentication</AlertTitle>
      <AlertDescription>
        Please wait while we check your authentication status...
      </AlertDescription>
    </Alert>
  );
};

export default SetupAuthChecker;
