
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const SetupWelcomeAlert: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle>Welcome back to the setup wizard</AlertTitle>
      <AlertDescription>
        Your system is already set up, but you can make changes to your configuration here.
        Any changes you make will be applied immediately.
      </AlertDescription>
    </Alert>
  );
};

export default SetupWelcomeAlert;
