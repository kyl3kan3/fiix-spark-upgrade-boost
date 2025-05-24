
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
      
      // Handle company assignment first to satisfy the NOT NULL constraint
      let companyId: string | undefined;

      if (isInvited && inviteDetails) {
        // Use invited company
        companyId = inviteDetails.organization_id;
        console.log("User was invited to company:", companyId);
        
        // Make sure organization exists in organizations table
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("id", companyId)
          .maybeSingle();
          
        if (!org) {
          // Create organization record if it doesn't exist
          const { data: company } = await supabase
            .from("companies")
            .select("name")
            .eq("id", companyId)
            .maybeSingle();
            
          if (company) {
            // First check if org exists to avoid duplicate key violation
            const { data: existingOrg } = await supabase
              .from("organizations")
              .select("id")
              .eq("id", companyId)
              .maybeSingle();
              
            if (!existingOrg) {
              // Insert only if it doesn't exist already
              const { error: insertError } = await supabase
                .from("organizations")
                .insert({
                  id: companyId,
                  name: company.name
                });
                
              if (insertError) {
                console.error("Error creating organization record:", insertError);
              } else {
                console.log("Created organization record for invited company");
              }
            }
          }
        }
      } else if (state.company) {
        // Create new company since it's required
        try {
          console.log("Creating new company:", state.company);
          // Fix: Pass company name in the expected format
          const newCompany = await createCompany({
            companyName: state.company // Use companyName instead of company
          });
          
          companyId = newCompany.id;
          
          // Make sure there's a matching organization record
          // First check if organization already exists
          const { data: existingOrg } = await supabase
            .from("organizations")
            .select("id")
            .eq("id", newCompany.id)
            .maybeSingle();
            
          if (!existingOrg) {
            // Only insert if it doesn't exist
            const { error: insertError } = await supabase
              .from("organizations")
              .insert({
                id: newCompany.id,
                name: state.company
              });
              
            if (insertError) {
              console.error("Error creating organization record:", insertError);
            } else {
              console.log("Created organization record for new company");
            }
          }
            
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
      
      // Now update the profile with all information including company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          role: isInvited ? inviteDetails?.role : "administrator",
          company_id: companyId
        })
        .eq("id", user.id);
        
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
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
