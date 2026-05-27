
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FormState, InviteDetails } from "./types";
import { clearOnboardingStorage, setSetupComplete } from "./storageUtils";
import { logger } from "@/lib/logger";

export const useOnboardingSubmit = (
 state: FormState,
 isInvited: boolean,
 inviteDetails: InviteDetails | null
) => {
 const [submitting, setSubmitting] = useState(false);
 const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSubmitting(true);

 try {
 logger.log("Starting onboarding submission with state:", state);
 const { data: { user } } = await supabase.auth.getUser();
 
 if (!user) {
 toast.error("User not found. Please log in again.");
 navigate("/auth");
 return;
 }

 // Update user profile with name
 const names = state.fullName.split(' ');
 const firstName = names[0];
 const lastName = names.slice(1).join(' ');
 
 logger.log("Updating user profile with name:", { firstName, lastName, role: state.role });
 
 // Handle company assignment first to satisfy the NOT NULL constraint
 let companyId: string | undefined;

 if (isInvited && inviteDetails) {
      // Accept the invitation atomically via SECURITY DEFINER RPC.
      // This bypasses the restrictive RLS policy that blocks users from
      // changing their own company_id / role on the profiles table.
      const token = localStorage.getItem("pending_invite_token");
      if (!token) {
        toast.error("Invitation token missing. Please open the invite link again.");
        setSubmitting(false);
        return;
      }

      const { data: acceptResult, error: acceptError } = await supabase.rpc(
        "accept_invitation",
        {
          _token: token,
          _first_name: firstName,
          _last_name: lastName,
          _phone: state.phoneNumber?.trim() || undefined,
        }
      );

      if (acceptError) {
        console.error("Error accepting invitation:", acceptError);
        toast.error(acceptError.message || "Failed to accept invitation");
        setSubmitting(false);
        return;
      }

      companyId = (acceptResult as any)?.company_id ?? inviteDetails.organization_id;
      logger.log("Invitation accepted, linked to company:", companyId);

      setSetupComplete();
      clearOnboardingStorage();
      localStorage.removeItem("pending_invite_token");

      toast.success("Invitation accepted! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
      return;
      } else if (state.accountType === "personal") {
        try {
          logger.log("Completing personal onboarding");
          const { error: personalError } = await supabase.rpc(
            "complete_personal_onboarding",
            {
              _first_name: firstName,
              _last_name: lastName,
              _phone: state.phoneNumber?.trim() || undefined,
            }
          );
          if (personalError) {
            console.error("Personal onboarding error:", personalError);
            toast.error(personalError.message || "Failed to complete onboarding");
            setSubmitting(false);
            return;
          }
          setSetupComplete();
          clearOnboardingStorage();
          toast.success("You're all set! Redirecting...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 800);
          return;
        } catch (err: any) {
          console.error("Personal onboarding error:", err);
          toast.error(err.message || "Failed to complete onboarding");
          setSubmitting(false);
          return;
        }
      } else if (state.company) {
  try {
  logger.log("Completing owner onboarding for company:", state.company);

  const { data: onboardingResult, error: onboardingError } = await supabase.rpc(
    "complete_owner_onboarding",
    {
      _company_name: state.company,
      _first_name: firstName,
      _last_name: lastName,
      _phone: state.phoneNumber?.trim() || undefined,
    }
  );

  if (onboardingError) {
    console.error("Owner onboarding error:", onboardingError);
    toast.error(onboardingError.message || "Failed to create company");
    setSubmitting(false);
    return;
  }

  companyId = (onboardingResult as any)?.company_id;

  if (!companyId) {
    throw new Error("Company created without an id");
  }

  logger.log("Owner onboarding completed for company:", companyId);
  toast.success("Company created successfully!");
  } catch (err: any) {
  console.error("Company creation error:", err);
  toast.error(err.message || "Failed to create company");
  setSubmitting(false);
  return;
  }
 } else {
 // Company is now required
 toast.error("Company information is required");
 setSubmitting(false);
 return;
 }
 
  if (isInvited) {
  // Now update the profile with non-restricted fields for invited users only.
  const { error: profileError } = await supabase
  .from("profiles")
  .update({
  first_name: firstName,
  last_name: lastName,
  phone_number: state.phoneNumber?.trim() || null,
  })
  .eq("id", user.id);
 
  if (profileError) {
  console.error("Profile update error:", profileError);
  throw profileError;
  }
  }

 if (isInvited && inviteDetails) {
 // Update invitation status
 const { error: inviteError } = await supabase
 .from("organization_invitations")
 .update({ 
 status: "accepted", 
 accepted_at: new Date().toISOString() 
 })
 .eq("id", inviteDetails.id);
 
 if (inviteError) {
 console.error("Error updating invitation status:", inviteError);
 throw inviteError;
 }
 }

 setSetupComplete();
 clearOnboardingStorage();
 localStorage.removeItem("pending_invite_token");
 
 toast.success("Onboarding complete! Redirecting to dashboard...");
 setTimeout(() => {
  window.location.href = "/dashboard";
 }, 1000);
 } catch (error: any) {
 console.error("Error during onboarding:", error);
 toast.error(error.message || "Failed to complete onboarding");
 } finally {
 setSubmitting(false);
 }
 };

 return { submitting, handleSubmit };
};
