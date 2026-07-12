import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getBrowserTimezone } from "@/constants/timezones";
import { logger } from "@/lib/logger";
import {
  acceptOnboardingInvitation,
  completeOwnerOnboarding,
  completePersonalOnboarding,
  notifyTrialSignup,
} from "@/services/onboardingSubmissionService";
import { getCurrentUser } from "@/services/supabaseHelpers";
import { clearOnboardingStorage, setSetupComplete } from "./storageUtils";
import type { FormState, InviteDetails } from "./types";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export const useOnboardingSubmit = (
  state: FormState,
  isInvited: boolean,
  inviteDetails: InviteDetails | null,
) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const finishOnboarding = () => {
    setSetupComplete();
    clearOnboardingStorage();
    localStorage.removeItem("pending_invite_token");
  };

  const redirectToDashboard = (delay: number) => {
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, delay);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("User not found. Please log in again.");
        navigate("/auth");
        return;
      }

      const [firstName = "", ...lastNameParts] = state.fullName.trim().split(/\s+/);
      const profile = {
        firstName,
        lastName: lastNameParts.join(" "),
        phone: state.phoneNumber?.trim() || undefined,
      };

      if (isInvited && inviteDetails) {
        const token = localStorage.getItem("pending_invite_token");
        if (!token) {
          throw new Error(
            "Invitation token missing. Please open the invite link again.",
          );
        }

        const companyId =
          await acceptOnboardingInvitation(token, profile) ??
          inviteDetails.organization_id;
        logger.log("Invitation accepted, linked to company:", companyId);
        finishOnboarding();
        toast.success("Invitation accepted! Redirecting to dashboard...");
        redirectToDashboard(800);
        return;
      }

      if (state.accountType === "personal") {
        await completePersonalOnboarding(profile);
        finishOnboarding();
        toast.success("You're all set! Redirecting...");
        redirectToDashboard(800);
        return;
      }

      if (!state.company?.trim()) {
        throw new Error("Company information is required");
      }

      const companyId = await completeOwnerOnboarding({
        ...profile,
        companyName: state.company,
        timezone: getBrowserTimezone(),
      });
      logger.log("Owner onboarding completed for company:", companyId);
      toast.success("Company created successfully!");

      void notifyTrialSignup(state.company, companyId).catch((error) => {
        logger.log("Trial signup notification failed:", error);
      });
      void import("@/lib/analytics/trialEvents")
        .then(({ trackTrialEvent }) =>
          trackTrialEvent("trial_signup_completed", {
            companyId,
            metadata: { source: "onboarding" },
          })
        )
        .catch((error) => logger.log("Trial signup tracking failed:", error));

      finishOnboarding();
      toast.success("Onboarding complete! Redirecting to dashboard...");
      redirectToDashboard(1000);
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error(errorMessage(error, "Failed to complete onboarding"));
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmit };
};
