
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { validateInvitationEmail } from "@/services/team/invitationValidation";
import { getOrCreateOrganization } from "@/services/team/organizationService";
import { checkExistingInvitation, createInvitation, getExistingInvitation } from "@/services/team/invitationService";
import { sendInvitationEmail } from "@/services/team/invitationEmailService";

export function useTeamInvitation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async (inviteEmail: string, isResend = false) => {
    setError(null);
    
    console.log("=== INVITATION PROCESS START ===");
    console.log("Starting invitation process for:", inviteEmail, "isResend:", isResend);
    
    const validationError = validateInvitationEmail(inviteEmail);
    if (validationError) {
      console.error("1. FAILED: Email validation error:", validationError);
      setError(validationError);
      return false;
    }

    console.log("1. SUCCESS: Email validation passed");

    // Check authentication more thoroughly
    if (!user?.id) {
      console.error("1. FAILED: User not authenticated", { user });
      setError("You must be logged in to send invitations. Please refresh the page and try again.");
      toast.error("Please log in to send invitations");
      return false;
    }
    
    console.log("1. SUCCESS: User authenticated", { userId: user.id });

    setIsSubmitting(true);

    try {
      console.log("2. Starting organization setup...");
      
      // Get or create organization
      const { organizationId, companyName } = await getOrCreateOrganization(user.id);
      console.log("2. SUCCESS: Organization setup complete", { organizationId, companyName });

      let inviteData;

      if (isResend) {
        console.log("3. RESEND: Looking for existing invitation...");
        // For resend, get the existing invitation instead of checking for duplicates
        inviteData = await getExistingInvitation(inviteEmail, organizationId);
        if (!inviteData) {
          console.error("3. FAILED: No existing invitation found for resend");
          throw new Error("No existing invitation found to resend");
        }
        console.log("3. SUCCESS: Found existing invitation for resend", { invitationId: inviteData.id });
      } else {
        console.log("3. Checking for existing invitations...");
        // For new invitations, check for duplicates
        await checkExistingInvitation(inviteEmail, organizationId);
        console.log("3. SUCCESS: No existing invitations found");

        console.log("4. Creating invitation...");
        // Create the invitation
        inviteData = await createInvitation(inviteEmail, organizationId, user.id);
        console.log("4. SUCCESS: Invitation created", { invitationId: inviteData.id });
      }

      console.log("5. Sending email...");
      // Send email invitation
      try {
        await sendInvitationEmail(inviteEmail, companyName, inviteData.token, user.id, inviteData.id);
        console.log("5. SUCCESS: Email sent successfully");
      } catch (emailError: any) {
        console.error("5. ERROR: Email sending failed:", emailError);
        console.error("Email error details:", emailError.message);
        // Don't fail the whole process if email fails, but show a warning
        toast.error("Invitation created but email failed to send. Please contact the user directly.");
        return true; // Still return success since invitation was created
      }
      
      console.log("=== INVITATION PROCESS COMPLETE ===");
      
      if (isResend) {
        toast.success(`Invitation resent to ${inviteEmail}`);
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
      }
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
