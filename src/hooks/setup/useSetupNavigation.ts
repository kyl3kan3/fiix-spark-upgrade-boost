
import { useState, useCallback } from "react";

export function useSetupNavigation() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    setCurrentStep
  };
}
