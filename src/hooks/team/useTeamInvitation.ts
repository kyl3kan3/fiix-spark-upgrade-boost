
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTeamInvitation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async (inviteEmail: string) => {
    setError(null);
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }

    setIsSubmitting(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("Sending invitation to:", inviteEmail);

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile.company_id) {
        throw new Error("No company associated with your account");
      }

      console.log("User company ID:", profile.company_id);

      // Check if organization already exists
      const { data: existingOrg, error: orgCheckError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (orgCheckError) {
        console.error("Error checking organization:", orgCheckError);
        throw orgCheckError;
      }

      let organizationId = profile.company_id;

      // If organization doesn't exist, create it
      if (!existingOrg) {
        console.log("Creating organization for company:", profile.company_id);
        
        // Get company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();
        
        if (companyError) {
          console.error("Error fetching company:", companyError);
          throw new Error("Failed to fetch company information");
        }
        
        // Create organization
        const { data: newOrg, error: createOrgError } = await supabase
          .from("organizations")
          .insert({
            id: profile.company_id,
            name: company?.name || "Organization"
          })
          .select()
          .single();
          
        if (createOrgError) {
          console.error("Error creating organization:", createOrgError);
          throw new Error("Failed to create organization");
        }
        
        organizationId = newOrg.id;
        console.log("Created organization:", organizationId);
      }

      // Create the invitation
      console.log("Creating invitation for organization:", organizationId);
      const { error: inviteError } = await supabase
        .from("organization_invitations")
        .insert({
          email: inviteEmail,
          organization_id: organizationId,
          invited_by: user.id,
          role: "technician",
          token: crypto.randomUUID(),
        });

      if (inviteError) {
        console.error("Error creating invitation:", inviteError);
        throw inviteError;
      }

      console.log("Invitation created successfully");
      toast.success(`Invitation sent to ${inviteEmail}`);
      return true;
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      const errorMessage = err.message || "Failed to send invitation";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sendInvitation,
    isSubmitting,
    error
  };
}
