
import React from "react";
import { useOnboarding } from "@/hooks/onboarding";
import OnboardingFormFields from "./OnboardingFormFields";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const OnboardingForm: React.FC = () => {
  const {
    state,
    submitting,
    isInvited,
    inviteDetails,
    handleChange,
    handleCheckbox,
    handleSubmit,
  } = useOnboarding();

  return (
    <form onSubmit={handleSubmit}>
      <OnboardingFormFields
        state={state}
        isInvited={isInvited}
        inviteDetails={inviteDetails}
        handleChange={handleChange}
        handleCheckbox={handleCheckbox}
      />

      {/* Make company field required */}
      {!isInvited && !state.company && (
        <div className="mt-2 mb-4 text-red-500 text-sm">
          A company name is required
        </div>
      )}

      <div className="mt-6">
        <Button
          disabled={submitting || (!state.company && !isInvited)}
          type="submit"
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your account...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OnboardingForm;
