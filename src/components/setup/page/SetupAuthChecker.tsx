
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const SetupAuthChecker: React.FC = () => {
  return (
    <Alert className="bg-primary/10 border-primary/30 rounded-lg">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">Checking authentication</AlertTitle>
      <AlertDescription className="text-primary/80">
        Please wait while we check your authentication status...
      </AlertDescription>
    </Alert>
  );
};

export default SetupAuthChecker;
