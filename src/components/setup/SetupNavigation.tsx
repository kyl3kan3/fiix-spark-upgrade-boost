import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";

export const SetupNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentStep, 
    setCurrentStep, 
    setupData, 
    setupComplete,
    setSetupComplete 
  } = useSetup();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Save current step data to local storage
      localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
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
      // For now, we'll just use localStorage until we create a system_settings table
      localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
      localStorage.setItem('maintenease_setup_complete', 'true');
      
      setSetupComplete(true);
      toast.success("Setup completed successfully!");
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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
        disabled={currentStep === 0}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      <div className="flex gap-2">
        {currentStep < steps.length - 2 && (
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        )}
        
        {currentStep === steps.length - 1 ? (
          <Button 
            onClick={handleComplete}
            disabled={setupComplete}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> 
            Complete Setup
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
