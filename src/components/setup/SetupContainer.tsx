
import React from "react";
import { useSetup } from "./SetupContext";
import { SetupHeader } from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { setupSteps } from "./setupSteps";
import { Loader2 } from "lucide-react";

const SetupContainer: React.FC = () => {
  const { 
    isAuthenticated, 
    isAuthLoading, 
    isDataLoading, 
    currentStep 
  } = useSetup();

  // Show loading while checking auth or loading data
  if (isAuthLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4">Loading setup...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth will be handled by useSetupAuth hook
  if (!isAuthenticated) {
    return null;
  }

  const CurrentStepComponent = setupSteps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SetupHeader />
        <SetupProgress />
        
        <div className="mt-8">
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>
        
        <SetupNavigation />
      </div>
    </div>
  );
};

export default SetupContainer;
