
import React from "react";
import SetupHeader from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { steps } from "./setupSteps";

export interface SetupStepComponentProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export const SetupContent: React.FC = () => {
  const currentStep = 0; // This should come from context

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SetupHeader 
          title="Setup Your MaintenEase System" 
          subtitle="Let's get your maintenance management system configured" 
        />
        <SetupProgress />
        
        <div className="mt-8">
          {CurrentStepComponent && <CurrentStepComponent data={{}} onUpdate={() => {}} />}
        </div>
        
        <SetupNavigation />
      </div>
    </div>
  );
};
