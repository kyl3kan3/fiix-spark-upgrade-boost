
import { useState } from "react";

export function useSetupNavigationSimple() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep
  };
}
