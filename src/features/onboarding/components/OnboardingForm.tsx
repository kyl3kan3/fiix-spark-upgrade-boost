
import React from "react";
import { useOnboarding } from "@/features/onboarding/hooks";
import OnboardingFormFields from "./OnboardingFormFields";
import MaterialIcon from "@/components/ui/material-icon";

const OnboardingForm: React.FC = () => {
  const {
    state,
    submitting,
    isInvited,
    inviteDetails,
    handleChange,
    handleCheckbox,
    handleSubmit,
    setAccountType,
  } = useOnboarding();

  // Check if required fields are filled
  const requiresCompany = !isInvited && state.accountType === "company";
  const isFormValid =
    state.fullName.trim() &&
    state.role.trim() &&
    (!requiresCompany || state.company.trim()) &&
    state.email.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OnboardingFormFields
        state={state}
        isInvited={isInvited}
        inviteDetails={inviteDetails}
        handleChange={handleChange}
        handleCheckbox={handleCheckbox}
        setAccountType={setAccountType}
      />

      {/* Validation messages */}
      {!state.fullName && (
        <p className="font-label-sm text-label-sm text-error">Please enter your full name</p>
      )}

      {requiresCompany && !state.company && (
        <p className="font-label-sm text-label-sm text-error">A company name is required</p>
      )}

      <div className="mt-gutter flex flex-col sm:flex-row items-center gap-4">
        <button
          disabled={submitting || !isFormValid}
          type="submit"
          className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label-md text-label-md uppercase tracking-wider shadow-md hover:translate-y-[-2px] hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <MaterialIcon name="sync" className="animate-spin" />
              Setting up your account...
            </>
          ) : (
            "Get Started with My Workspace"
          )}
        </button>
        <button
          type="button"
          className="text-primary font-label-md text-label-md hover:underline px-6 py-4 transition-all"
          onClick={() => window.location.href = "/dashboard"}
        >
          Skip for now
        </button>
      </div>
    </form>
  );
};

export default OnboardingForm;
