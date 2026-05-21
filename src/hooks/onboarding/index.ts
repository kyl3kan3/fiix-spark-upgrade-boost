
import { useCallback, useEffect, useState } from "react";
import { FormState, UseOnboardingReturn } from "./types";
import { getInitialEmail, getInitialCompanyName } from "./storageUtils";
import { useInvitation } from "./useInvitation";
import { useUserData } from "./useUserData";
import { useOnboardingSubmit } from "./useOnboardingSubmit";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = (): UseOnboardingReturn => {
 const [state, setState] = useState<FormState>({
 company: getInitialCompanyName(),
 fullName: "",
 role: "",
 email: getInitialEmail(),
 phoneNumber: "",
 notifications: true,
 });

 // Check if user is invited
 const { isInvited, inviteDetails } = useInvitation(state.email);

 // Set fullName function for the useUserData hook
 const setFullName = useCallback((fullName: string) => {
 setState(prev => (prev.fullName === fullName ? prev : { ...prev, fullName }));
 }, []);

 // Fetch user data
 useUserData(setFullName);

  useEffect(() => {
    let isMounted = true;

    const syncSignedInEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const signedInEmail = user?.email ?? "";

      if (!isMounted || !signedInEmail) {
        return;
      }

      setState(prev => {
        if (prev.email === signedInEmail) {
          return prev;
        }

        const hasPendingInvite = !!localStorage.getItem("pending_invite_token");
        if (hasPendingInvite && prev.email.trim()) {
          return prev;
        }

        return { ...prev, email: signedInEmail };
      });
    };

    syncSignedInEmail();

    return () => {
      isMounted = false;
    };
  }, []);

 // Handle form submission
 const { submitting, handleSubmit } = useOnboardingSubmit(state, isInvited, inviteDetails);

 // Form change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (v: boolean) => {
  setState((prev) => ({ ...prev, notifications: v }));
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
