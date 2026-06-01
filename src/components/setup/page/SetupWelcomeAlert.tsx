
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const SetupWelcomeAlert: React.FC = () => {
 return (
 <Alert className="bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary">
 <Info className="h-4 w-4 text-primary dark:text-primary" />
 <AlertTitle>Welcome back to the setup wizard</AlertTitle>
 <AlertDescription>
 Your system is already set up, but you can make changes to your configuration here.
 Any changes you make will be applied immediately.
 </AlertDescription>
 </Alert>
 );
};

export default SetupWelcomeAlert;
