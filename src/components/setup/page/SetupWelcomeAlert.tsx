
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const SetupWelcomeAlert: React.FC = () => {
  return (
    <Alert className="bg-primary/10 border-primary/30 rounded-lg">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">Welcome back to the setup wizard</AlertTitle>
      <AlertDescription className="text-primary/80">
        Your system is already set up, but you can make changes to your configuration here.
        Any changes you make will be applied immediately.
      </AlertDescription>
    </Alert>
  );
};

export default SetupWelcomeAlert;
