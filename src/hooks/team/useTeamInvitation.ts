
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
    console.log("=== HOOK INVITATION PROCESS START ===");
    console.log("useTeamInvitation.sendInvitation called with:", { inviteEmail, isResend });
    console.log("Current user:", user);
    console.log("Hook state:", { isSubmitting, error });
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      console.log("1. Starting email validation...");
      const validationError = validateInvitationEmail(inviteEmail);
      if (validationError) {
        console.error("1. FAILED: Email validation error:", validationError);
        setError(validationError);
        toast.error(validationError);
        return false;
      }
      console.log("1. SUCCESS: Email validation passed");

      // Check authentication more thoroughly
      if (!user?.id) {
        console.error("2. FAILED: User not authenticated", { user });
        const authError = "You must be logged in to send invitations. Please refresh the page and try again.";
        setError(authError);
        toast.error("Please log in to send invitations");
        return false;
      }
      console.log("2. SUCCESS: User authenticated", { userId: user.id });

      console.log("3. Starting organization setup...");
      // Get or create organization
      const { organizationId, companyName } = await getOrCreateOrganization(user.id);
      console.log("3. SUCCESS: Organization setup complete", { organizationId, companyName });

      let inviteData;

      if (isResend) {
        console.log("4. RESEND: Looking for existing invitation...");
        // For resend, get the existing invitation instead of checking for duplicates
        inviteData = await getExistingInvitation(inviteEmail, organizationId);
        if (!inviteData) {
          console.error("4. FAILED: No existing invitation found for resend");
          throw new Error("No existing invitation found to resend");
        }
        console.log("4. SUCCESS: Found existing invitation for resend", { invitationId: inviteData.id });
      } else {
        console.log("4. Checking for existing invitations...");
        // For new invitations, check for duplicates
        await checkExistingInvitation(inviteEmail, organizationId);
        console.log("4. SUCCESS: No existing invitations found");

        console.log("5. Creating invitation...");
        // Create the invitation
        inviteData = await createInvitation(inviteEmail, organizationId, user.id);
        console.log("5. SUCCESS: Invitation created", { invitationId: inviteData.id });
      }

      console.log("6. Sending email...");
      // Send email invitation
      try {
        await sendInvitationEmail(inviteEmail, companyName, inviteData.token, user.id, inviteData.id);
        console.log("6. SUCCESS: Email sent successfully");
      } catch (emailError: any) {
        console.error("6. ERROR: Email sending failed:", emailError);
        console.error("Email error details:", emailError.message);
        // Don't fail the whole process if email fails, but show a warning
        toast.error("Invitation created but email failed to send. Please contact the user directly.");
        return true; // Still return success since invitation was created
      }
      
      console.log("=== HOOK INVITATION PROCESS COMPLETE ===");
      
      if (isResend) {
        toast.success(`Invitation resent to ${inviteEmail}`);
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
      }
      return true;
      
    } catch (err: any) {
      console.error("=== HOOK INVITATION PROCESS FAILED ===");
      console.error("Complete error in sendInvitation:", err);
      console.error("Error stack:", err.stack);
      const errorMessage = err.message || "Failed to send invitation";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  return {
    sendInvitation,
    isSubmitting,
    error
  };
}
