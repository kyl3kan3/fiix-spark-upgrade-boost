
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
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
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
        throw new Error(`Failed to check organization: ${orgCheckError.message}`);
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
          throw new Error(`Failed to fetch company information: ${companyError.message}`);
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
          console.error("Organization creation data:", {
            id: profile.company_id,
            name: company?.name || "Organization"
          });
          throw new Error(`Failed to create organization: ${createOrgError.message}`);
        }
        
        organizationId = newOrg.id;
        console.log("Created organization:", organizationId);
      }

      // Check if user already has an invitation pending
      console.log("Checking for existing invitations for:", inviteEmail, "in organization:", organizationId);
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from("organization_invitations")
        .select("id, status")
        .eq("email", inviteEmail)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .maybeSingle();

      if (inviteCheckError) {
        console.error("Error checking existing invitations:", inviteCheckError);
        throw new Error(`Failed to check existing invitations: ${inviteCheckError.message}`);
      }

      if (existingInvite) {
        throw new Error("An invitation for this email is already pending");
      }

      // Create the invitation with detailed logging
      console.log("Creating invitation with data:", {
        email: inviteEmail,
        organization_id: organizationId,
        invited_by: user.id,
        role: "technician"
      });
      
      const invitationData = {
        email: inviteEmail,
        organization_id: organizationId,
        invited_by: user.id,
        role: "technician",
        token: crypto.randomUUID(),
      };

      const { data: inviteData, error: inviteError } = await supabase
        .from("organization_invitations")
        .insert(invitationData)
        .select();

      if (inviteError) {
        console.error("Error creating invitation:", inviteError);
        console.error("Invitation data that failed:", invitationData);
        throw new Error(`Failed to create invitation: ${inviteError.message}`);
      }

      console.log("Invitation created successfully:", inviteData);
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
