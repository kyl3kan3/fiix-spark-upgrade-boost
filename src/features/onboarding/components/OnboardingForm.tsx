
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
 <div className="text-red-500 text-sm">
 Please enter your full name
 </div>
 )}
 
      {requiresCompany && !state.company && (
 <div className="text-red-500 text-sm">
 A company name is required
 </div>
 )}

 <div className="mt-6">
 <Button
 disabled={submitting || !isFormValid}
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
