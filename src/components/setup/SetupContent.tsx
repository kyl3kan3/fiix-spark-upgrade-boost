
import React, { useState } from "react";
import SetupHeader from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { steps } from "./setupSteps";
import { useSetupNavigationSimple } from "@/hooks/setup/useSetupNavigationSimple";

export interface SetupStepComponentProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export const SetupContent: React.FC = () => {
  const { currentStep, setCurrentStep, nextStep, prevStep } = useSetupNavigationSimple();
  const [setupData, setSetupData] = useState<any>({});

  const updateSetupData = (updates: any) => {
    setSetupData((prev: any) => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SetupHeader 
          title="Setup Your MaintenEase System" 
          subtitle="Let's get your maintenance management system configured" 
        />
        <SetupProgress currentStep={currentStep} totalSteps={steps.length} />
        
        <div className="mt-8">
          {CurrentStepComponent && (
            <CurrentStepComponent 
              data={setupData} 
              onUpdate={updateSetupData} 
            />
          )}
        </div>
        
        <SetupNavigation 
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrevious={prevStep}
          setupData={setupData}
          onSetCurrentStep={setCurrentStep}
        />
      </div>
    </div>
  );
};
