
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { validateInvitationEmail } from "@/services/team/invitationValidation";
import { getOrCreateOrganization } from "@/services/team/organizationService";
import { checkExistingInvitation, createInvitation, getExistingInvitation } from "@/services/team/invitationService";
import { sendInvitationEmail } from "@/services/team/invitationEmailService";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export function useTeamInvitation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<string[]>([]);

  const addStatusUpdate = (message: string) => {
    logger.log(message);
    setStatusUpdates(prev => [...prev, message]);
  };

  const clearStatusUpdates = () => {
    setStatusUpdates([]);
  };

  const debugInvitations = async (email: string, organizationId: string) => {
    logger.log("=== DEBUG: ALL INVITATIONS FOR EMAIL ===");
    const { data: allInvites, error } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("email", email)
      .order('created_at', { ascending: false });
    
    logger.log("All invitations for email:", allInvites);
    logger.log("Total count:", allInvites?.length || 0);
    
    const { data: orgInvites, error: orgError } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("organization_id", organizationId)
      .order('created_at', { ascending: false });
    
    logger.log("All invitations for organization:", orgInvites);
    logger.log("Organization invites count:", orgInvites?.length || 0);
  };

  const sendInvitation = async (inviteEmail: string, isResend = false) => {
    logger.log("🚀 INVITATION PROCESS STARTING");
    logger.log("Email to invite:", inviteEmail);
    logger.log("Is resend:", isResend);
    logger.log("Current user:", user?.id);
    
    setError(null);
    setIsSubmitting(true);
    clearStatusUpdates();
    
    try {
      // Step 1: Validate email
      addStatusUpdate("📧 Validating email address...");
      const validationError = validateInvitationEmail(inviteEmail);
      if (validationError) {
        console.error("❌ Email validation failed:", validationError);
        setError(validationError);
        toast.error(validationError);
        return false;
      }
      addStatusUpdate("✅ Email validation passed");

      // Step 2: Check authentication
      addStatusUpdate("🔐 Checking user authentication...");
      if (!user?.id) {
        console.error("❌ User not authenticated");
        const authError = "You must be logged in to send invitations.";
        setError(authError);
        toast.error("Please log in to send invitations");
        return false;
      }
      addStatusUpdate("✅ User authenticated");

      // Step 3: Get organization - passing the addStatusUpdate callback
      addStatusUpdate("🏢 Setting up organization...");
      let organizationData;
      try {
        organizationData = await getOrCreateOrganization(user.id, addStatusUpdate);
        logger.log("✅ Organization data:", organizationData);
        addStatusUpdate("✅ Organization setup complete");
      } catch (orgError: any) {
        console.error("❌ Organization setup failed:", orgError);
        const orgErrorMessage = `Organization setup failed: ${orgError.message}`;
        setError(orgErrorMessage);
        toast.error(orgErrorMessage);
        addStatusUpdate(`❌ ${orgErrorMessage}`);
        return false;
      }

      const { organizationId, companyName } = organizationData;

      // Step 4: Debug existing invitations
      addStatusUpdate("🔍 Checking for existing invitations...");
      await debugInvitations(inviteEmail, organizationId);

      let inviteData;

      if (isResend) {
        addStatusUpdate("🔄 Looking for existing invitation to resend...");
        inviteData = await getExistingInvitation(inviteEmail, organizationId);
        if (!inviteData) {
          console.error("❌ No existing invitation found for resend");
          const resendError = "No existing invitation found to resend";
          setError(resendError);
          toast.error(resendError);
          addStatusUpdate(`❌ ${resendError}`);
          return false;
        }
        addStatusUpdate("✅ Found existing invitation to resend");
      } else {
        addStatusUpdate("🔍 Checking for duplicate invitations...");
        try {
          await checkExistingInvitation(inviteEmail, organizationId);
          addStatusUpdate("✅ No duplicate invitations found");
        } catch (existingError: any) {
          console.error("❌ Duplicate invitation check failed:", existingError.message);
          if (existingError.message.includes("already pending")) {
            const helpMessage = "There's already a pending invitation for this email. Please delete the existing invitation first or use the resend option.";
            setError(helpMessage);
            toast.error(helpMessage);
            addStatusUpdate(`❌ ${helpMessage}`);
            return false;
          }
          setError(existingError.message);
          toast.error(existingError.message);
          addStatusUpdate(`❌ ${existingError.message}`);
          return false;
        }

        addStatusUpdate("➕ Creating new invitation...");
        try {
          inviteData = await createInvitation(inviteEmail, organizationId, user.id);
          logger.log("✅ Invitation created:", inviteData.id);
          addStatusUpdate("✅ Invitation created successfully");
        } catch (createError: any) {
          console.error("❌ Failed to create invitation:", createError);
          const createErrorMessage = `Failed to create invitation: ${createError.message}`;
          setError(createErrorMessage);
          toast.error(createErrorMessage);
          addStatusUpdate(`❌ ${createErrorMessage}`);
          return false;
        }
      }

      addStatusUpdate("📤 Sending email notification...");
      try {
        await sendInvitationEmail(inviteEmail, companyName, inviteData.token, user.id, inviteData.id);
        logger.log("✅ Email sent successfully");
        addStatusUpdate("✅ Email sent successfully");
      } catch (emailError: any) {
        console.error("❌ Email sending failed:", emailError);
        const emailErrorMessage = "Invitation created but email failed to send. Please contact the user directly.";
        toast.error(emailErrorMessage);
        addStatusUpdate(`⚠️ ${emailErrorMessage}`);
        // Don't set error state since invitation was created successfully
        return true; // Still return success since invitation was created
      }
      
      logger.log("🎉 INVITATION PROCESS COMPLETED SUCCESSFULLY");
      addStatusUpdate("🎉 Invitation process completed successfully!");
      
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
      addStatusUpdate(`💥 Error: ${errorMessage}`);
      return false;
    } finally {
      logger.log("🏁 Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  return {
    sendInvitation,
    isSubmitting,
    error,
    statusUpdates,
    clearStatusUpdates
  };
}
