
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { validateInvitationEmail } from "@/services/team/invitationValidation";
import { getOrCreateOrganization } from "@/services/team/organizationService";
import { checkExistingInvitation, createInvitation, getExistingInvitation } from "@/services/team/invitationService";
import { sendInvitationEmail } from "@/services/team/invitationEmailService";
import { supabase } from "@/integrations/supabase/client";

export function useTeamInvitation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debugInvitations = async (email: string, organizationId: string) => {
    console.log("=== DEBUG: ALL INVITATIONS FOR EMAIL ===");
    const { data: allInvites, error } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("email", email)
      .order('created_at', { ascending: false });
    
    console.log("All invitations for email:", allInvites);
    console.log("Total count:", allInvites?.length || 0);
    
    const { data: orgInvites, error: orgError } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("organization_id", organizationId)
      .order('created_at', { ascending: false });
    
    console.log("All invitations for organization:", orgInvites);
    console.log("Organization invites count:", orgInvites?.length || 0);
  };

  const sendInvitation = async (inviteEmail: string, isResend = false) => {
    console.log("🚀 INVITATION PROCESS STARTING");
    console.log("Email to invite:", inviteEmail);
    console.log("Is resend:", isResend);
    console.log("Current user:", user?.id);
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Step 1: Validate email
      console.log("📧 Step 1: Validating email...");
      const validationError = validateInvitationEmail(inviteEmail);
      if (validationError) {
        console.error("❌ Email validation failed:", validationError);
        setError(validationError);
        toast.error(validationError);
        return false;
      }
      console.log("✅ Email validation passed");

      // Step 2: Check authentication
      console.log("🔐 Step 2: Checking authentication...");
      if (!user?.id) {
        console.error("❌ User not authenticated");
        const authError = "You must be logged in to send invitations.";
        setError(authError);
        toast.error("Please log in to send invitations");
        return false;
      }
      console.log("✅ User authenticated:", user.id);

      // Step 3: Get organization
      console.log("🏢 Step 3: Getting organization...");
      let organizationData;
      try {
        organizationData = await getOrCreateOrganization(user.id);
        console.log("✅ Organization data:", organizationData);
      } catch (orgError: any) {
        console.error("❌ Organization setup failed:", orgError);
        throw new Error(`Organization setup failed: ${orgError.message}`);
      }

      const { organizationId, companyName } = organizationData;

      // Step 4: Debug existing invitations
      console.log("🔍 Step 4: Debugging existing invitations...");
      await debugInvitations(inviteEmail, organizationId);

      let inviteData;

      if (isResend) {
        console.log("🔄 Step 5a: Getting existing invitation for resend...");
        inviteData = await getExistingInvitation(inviteEmail, organizationId);
        if (!inviteData) {
          console.error("❌ No existing invitation found for resend");
          throw new Error("No existing invitation found to resend");
        }
        console.log("✅ Found existing invitation:", inviteData.id);
      } else {
        console.log("🔍 Step 5b: Checking for duplicate invitations...");
        try {
          await checkExistingInvitation(inviteEmail, organizationId);
          console.log("✅ No duplicate invitations found");
        } catch (existingError: any) {
          console.error("❌ Duplicate invitation check failed:", existingError.message);
          if (existingError.message.includes("already pending")) {
            const helpMessage = "There's already a pending invitation for this email. Please delete the existing invitation first or use the resend option.";
            setError(helpMessage);
            toast.error(helpMessage);
            return false;
          }
          throw existingError;
        }

        console.log("➕ Step 6: Creating new invitation...");
        try {
          inviteData = await createInvitation(inviteEmail, organizationId, user.id);
          console.log("✅ Invitation created:", inviteData.id);
        } catch (createError: any) {
          console.error("❌ Failed to create invitation:", createError);
          throw new Error(`Failed to create invitation: ${createError.message}`);
        }
      }

      console.log("📤 Step 7: Sending email...");
      try {
        await sendInvitationEmail(inviteEmail, companyName, inviteData.token, user.id, inviteData.id);
        console.log("✅ Email sent successfully");
      } catch (emailError: any) {
        console.error("❌ Email sending failed:", emailError);
        toast.error("Invitation created but email failed to send. Please contact the user directly.");
        return true; // Still return success since invitation was created
      }
      
      console.log("🎉 INVITATION PROCESS COMPLETED SUCCESSFULLY");
      
      if (isResend) {
        toast.success(`Invitation resent to ${inviteEmail}`);
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
      }
      return true;
      
    } catch (err: any) {
      console.error("💥 INVITATION PROCESS FAILED");
      console.error("Error details:", err);
      console.error("Error stack:", err.stack);
      const errorMessage = err.message || "Failed to send invitation";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      console.log("🏁 Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  return {
    sendInvitation,
    isSubmitting,
    error
  };
}
