
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";
import { saveSetupData } from "@/services/setup";
import { setSetupComplete as setLocalSetupComplete } from "@/hooks/onboarding/storageUtils";

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
    try {
      if (currentStep < steps.length - 1) {
        // Save current step data
        console.log("Saving setup data before moving to next step:", setupData);
        await saveSetupData(setupData, false);
        
        // Update step in state
        setCurrentStep(currentStep + 1);
        
        // Scroll to top for better UX
        window.scrollTo(0, 0);
        
        console.log(`Moving to step ${currentStep + 1}: ${steps[currentStep + 1].label}`);
      } else {
        console.log("Already at the last step");
      }
    } catch (error) {
      console.error("Error navigating to next step:", error);
      toast.error("There was a problem saving your progress. Please try again.");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
      console.log(`Moving to previous step ${currentStep - 1}: ${steps[currentStep - 1].label}`);
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
      // Mark setup as complete in context
      setSetupComplete(true);
      
      // Save setup data with completed flag to database
      const success = await saveSetupData(setupData, true);
      
      // Ensure localStorage is also updated
      setLocalSetupComplete();
      
      // Double-check the localStorage flag is set
      localStorage.setItem('maintenease_setup_complete', 'true');
      
      if (success) {
        toast.success("Setup completed successfully!");
        console.log("Setup marked as complete successfully");
        
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
    <div className="flex justify-between w-full border-t pt-6">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 0 || isLoading}
        type="button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      <div className="flex gap-2">
        {currentStep < steps.length - 2 && (
          <Button 
            variant="ghost" 
            onClick={handleSkip} 
            disabled={isLoading}
            type="button"
          >
            Skip for now
          </Button>
        )}
        
        {currentStep === steps.length - 1 ? (
          <Button 
            onClick={handleComplete}
            disabled={setupComplete || isLoading}
            type="button"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> 
            Complete Setup
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            disabled={isLoading}
            type="button"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
