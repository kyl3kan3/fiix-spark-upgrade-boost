
import React, { useState, useEffect } from "react";
import SetupHeader from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { steps } from "./setupSteps";
import { useSetupNavigationSimple } from "@/hooks/setup/useSetupNavigationSimple";
import { useOnboardingProgress } from "@/hooks/onboarding/useOnboardingProgress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";

export interface SetupStepComponentProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export const SetupContent: React.FC = () => {
  const { currentStep, setCurrentStep, nextStep, prevStep } = useSetupNavigationSimple();
  const [setupData, setSetupData] = useState<any>({});
  const { progress, setWizardStep } = useOnboardingProgress();
  const navigate = useNavigate();

  // Hydrate from DB once
  useEffect(() => {
    if (progress && progress.wizard_step !== currentStep && currentStep === 0 && progress.wizard_step > 0) {
      setCurrentStep(Math.min(progress.wizard_step, steps.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.id]);

  // Persist on step change
  useEffect(() => {
    if (progress && currentStep !== progress.wizard_step) {
      setWizardStep(currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const updateSetupData = (updates: any) => {
    setSetupData((prev: any) => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  const handleSaveExit = () => {
    setWizardStep(currentStep);
    toast.success("Progress saved. Pick up where you left off anytime.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <SetupHeader
            title="Setup Your MaintenEase System"
            subtitle="Let's get your maintenance management system configured"
          />
          <Button variant="outline" size="sm" onClick={handleSaveExit}>
            <Save className="h-4 w-4 mr-2" />
            Save & exit
          </Button>
        </div>
        <SetupProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={(s) => setCurrentStep(s)}
        />
        
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
