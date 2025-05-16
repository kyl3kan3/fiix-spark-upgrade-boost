
import { useState } from "react";
import { FormState, UseOnboardingReturn } from "./types";
import { getInitialEmail, getInitialCompanyName } from "./storageUtils";
import { useInvitation } from "./useInvitation";
import { useUserData } from "./useUserData";
import { useOnboardingSubmit } from "./useOnboardingSubmit";

export const useOnboarding = (): UseOnboardingReturn => {
  const [state, setState] = useState<FormState>({
    company: getInitialCompanyName(),
    fullName: "",
    role: "",
    email: getInitialEmail(),
    notifications: true,
  });

  // Check if user is invited
  const { isInvited, inviteDetails } = useInvitation(state.email);

  // Set fullName function for the useUserData hook
  const setFullName = (fullName: string) => {
    setState(prev => ({ ...prev, fullName }));
  };

  // Fetch user data
  useUserData(setFullName);

  // Handle form submission
  const { submitting, handleSubmit } = useOnboardingSubmit(state, isInvited, inviteDetails);

  // Form change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (v: boolean) => {
    setState({ ...state, notifications: v });
  };

  return {
    state,
    submitting,
    isInvited,
    inviteDetails,
    handleChange,
    handleCheckbox,
    handleSubmit
  };
};
