
import React from "react";
import { useOnboarding } from "@/features/onboarding/hooks";
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
 <p className="text-destructive text-sm">Please enter your full name</p>
 )}

      {requiresCompany && !state.company && (
 <p className="text-destructive text-sm">A company name is required</p>
 )}

 <div className="pt-2">
 <Button
 disabled={submitting || !isFormValid}
 type="submit"
 className="w-full bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold shadow-md hover:-translate-y-0.5 transition-all"
 >
 {submitting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Setting up your account...
 </>
 ) : (
 "Get Started with My Workspace"
 )}
 </Button>
 </div>
 </form>
 );
};

export default OnboardingForm;
