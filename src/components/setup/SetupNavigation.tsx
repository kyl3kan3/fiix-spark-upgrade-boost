
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { steps } from "./setupSteps";
import { saveSetupData } from "@/services/setup";
import { setSetupComplete as setLocalSetupComplete } from "@/hooks/onboarding/storageUtils";

interface SetupNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  setupData: any;
  onSetCurrentStep: (step: number) => void;
}

export const SetupNavigation: React.FC<SetupNavigationProps> = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  setupData, 
  onSetCurrentStep 
}) => {
  const navigate = useNavigate();

  const handleNext = async () => {
    try {
      if (currentStep < steps.length - 1) {
        // Save current step data
        console.log("Saving setup data before moving to next step:", setupData);
        await saveSetupData(setupData, false);
        
        // Update step in state
        onNext();
        
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
      onPrevious();
      window.scrollTo(0, 0);
      console.log(`Moving to previous step ${currentStep - 1}: ${steps[currentStep - 1].label}`);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      toast.info(`Skipped ${steps[currentStep].label} setup. You can configure this later.`);
      onNext();
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    try {
      // Save setup data with completed flag to database
      await saveSetupData(setupData, true);
      
      // Ensure localStorage is also updated
      setLocalSetupComplete();
      
      // Double-check the localStorage flag is set
      localStorage.setItem('maintenease_setup_complete', 'true');
      
      toast.success("Setup completed successfully!");
      console.log("Setup marked as complete successfully");
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
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
        disabled={currentStep === 0}
        type="button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      
      <div className="flex gap-2">
        {currentStep < steps.length - 2 && (
          <Button 
            variant="ghost" 
            onClick={handleSkip} 
            type="button"
          >
            Skip for now
          </Button>
        )}
        
        {currentStep === steps.length - 1 ? (
          <Button 
            onClick={handleComplete}
            type="button"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> 
            Complete Setup
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            type="button"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
