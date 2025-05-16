
import React from "react";
import { Button } from "@/components/ui/button";
import OnboardingFormFields from "./OnboardingFormFields";
import { useOnboarding } from "@/hooks/useOnboarding";

const OnboardingForm: React.FC = () => {
  const {
    state,
    submitting,
    isInvited,
    handleChange,
    handleCheckbox,
    handleSubmit
  } = useOnboarding();

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <OnboardingFormFields 
        company={state.company}
        fullName={state.fullName}
        role={state.role}
        email={state.email}
        notifications={state.notifications}
        isInvited={isInvited}
        handleChange={handleChange}
        handleCheckbox={handleCheckbox}
      />
      
      <div>
        <Button 
          className="w-full bg-maintenease-600 hover:bg-maintenease-700" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Finish Onboarding"}
        </Button>
      </div>
    </form>
  );
};

export default OnboardingForm;
