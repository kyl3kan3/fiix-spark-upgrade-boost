
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
      console.log("=== INVITATION PROCESS START ===");
      console.log("1. Starting invitation process for:", inviteEmail);
      
      if (!user?.id) {
        console.error("1. FAILED: User not authenticated", { user });
        throw new Error("User not authenticated");
      }
      
      console.log("1. SUCCESS: User authenticated", { userId: user.id });

      // Get user's company ID
      console.log("2. Fetching user profile...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("2. FAILED: Error fetching profile:", profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      if (!profile.company_id) {
        console.error("2. FAILED: No company associated with profile:", profile);
        throw new Error("No company associated with your account");
      }

      console.log("2. SUCCESS: User profile fetched", { companyId: profile.company_id });

      // Check if organization already exists
      console.log("3. Checking if organization exists...");
      const { data: existingOrg, error: orgCheckError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (orgCheckError) {
        console.error("3. FAILED: Error checking organization:", orgCheckError);
        throw new Error(`Failed to check organization: ${orgCheckError.message}`);
      }

      let organizationId = profile.company_id;

      // If organization doesn't exist, create it
      if (!existingOrg) {
        console.log("3. Organization doesn't exist, creating it...");
        
        // Get company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();
        
        if (companyError) {
          console.error("3. FAILED: Error fetching company:", companyError);
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
          console.error("3. FAILED: Error creating organization:", createOrgError);
          throw new Error(`Failed to create organization: ${createOrgError.message}`);
        }
        
        organizationId = newOrg.id;
        console.log("3. SUCCESS: Created organization:", organizationId);
      } else {
        console.log("3. SUCCESS: Organization exists:", existingOrg.id);
      }

      // Check if user already has an invitation pending
      console.log("4. Checking for existing invitations...");
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from("organization_invitations")
        .select("id, status")
        .eq("email", inviteEmail)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .maybeSingle();

      if (inviteCheckError) {
        console.error("4. FAILED: Error checking existing invitations:", inviteCheckError);
        throw new Error(`Failed to check existing invitations: ${inviteCheckError.message}`);
      }

      if (existingInvite) {
        console.log("4. FAILED: Found existing pending invitation:", existingInvite);
        throw new Error("An invitation for this email is already pending");
      }

      console.log("4. SUCCESS: No existing invitations found");

      // Create the invitation with detailed logging
      console.log("5. Creating new invitation...");
      const invitationData = {
        email: inviteEmail,
        organization_id: organizationId,
        invited_by: user.id,
        role: "technician",
        token: crypto.randomUUID(),
        status: "pending"
      };

      console.log("5. About to insert invitation with data:", invitationData);

      const { data: inviteData, error: inviteError } = await supabase
        .from("organization_invitations")
        .insert(invitationData)
        .select()
        .maybeSingle();

      if (inviteError) {
        console.error("5. FAILED: Database error creating invitation:", inviteError);
        console.error("Error details:", {
          code: inviteError.code,
          message: inviteError.message,
          details: inviteError.details,
          hint: inviteError.hint
        });
        throw new Error(`Failed to create invitation: ${inviteError.message}`);
      }

      if (!inviteData) {
        console.error("5. FAILED: No invitation data returned from insert");
        throw new Error("Failed to create invitation - no data returned");
      }

      console.log("5. SUCCESS: Invitation created successfully:", inviteData);
      console.log("=== INVITATION PROCESS COMPLETE ===");
      
      // TODO: Send actual email invitation here
      console.log("6. Email sending would happen here for:", inviteEmail);
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      return true;
      
    } catch (err: any) {
      console.error("=== INVITATION PROCESS FAILED ===");
      console.error("Complete error in sendInvitation:", err);
      console.error("Error stack:", err.stack);
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
