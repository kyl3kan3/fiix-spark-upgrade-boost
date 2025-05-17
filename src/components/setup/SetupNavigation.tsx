
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";
import { saveSetupData } from "@/services/setup";

export const SetupNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentStep, 
    setCurrentStep, 
    setupData, 
    setupComplete,
    setSetupComplete,
    isLoading 
  } = useSetup();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Save current step data
      await saveSetupData(setupData, false);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      toast.info(`Skipped ${steps[currentStep].label} setup. You can configure this later.`);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    try {
      setSetupComplete(true);
      // Save setup data with completed flag
      const success = await saveSetupData(setupData, true);
      
      if (success) {
        toast.success("Setup completed successfully!");
        localStorage.setItem('maintenease_setup_complete', 'true'); // Ensure local storage is set
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.error("There was an issue saving your setup data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving setup data:", error);
      toast.error("Failed to save setup data. Please try again.");
    }
  };

  return (
    <div className="flex justify-between border-t pt-6">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 0 || isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      <div className="flex gap-2">
        {currentStep < steps.length - 2 && (
          <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        
        {currentStep === steps.length - 1 ? (
          <Button 
            onClick={handleComplete}
            disabled={setupComplete || isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> 
            Complete Setup
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isLoading}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
