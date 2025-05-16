
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createCompany } from "@/services/company";
import { FormState, InviteDetails } from "./types";
import { clearOnboardingStorage, setSetupComplete } from "./storageUtils";

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
      console.log("Starting onboarding submission with state:", state);
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
      
      console.log("Updating user profile with name:", { firstName, lastName, role: state.role });
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          role: isInvited ? inviteDetails?.role : "administrator"
        })
        .eq("id", user.id);
        
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      if (isInvited && inviteDetails) {
        console.log("User was invited to company:", inviteDetails.organization_id);
        
        // Add user to the invited company
        const { error: companyError } = await supabase
          .from("profiles")
          .update({ company_id: inviteDetails.organization_id })
          .eq("id", user.id);
          
        if (companyError) {
          console.error("Error adding user to company:", companyError);
          throw companyError;
        }
        
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
        
        toast.success("You've joined the company!");
      } else if (state.company) {
        console.log("Creating new company:", state.company);
        try {
          await createCompany({
            companyName: state.company
          });
          
          toast.success("Company created successfully!");
        } catch (err: any) {
          console.error("Company creation error:", err);
          toast.error(err.message || "Failed to create company");
          setSubmitting(false);
          return;
        }
      }

      setSetupComplete();
      clearOnboardingStorage();
      
      toast.success("Onboarding complete! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
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
