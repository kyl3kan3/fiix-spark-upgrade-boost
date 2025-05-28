
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import { validateInvitationEmail } from "@/services/team/invitationValidation";
import { getOrCreateOrganization } from "@/services/team/organizationService";
import { checkExistingInvitation, createInvitation } from "@/services/team/invitationService";
import { sendInvitationEmail } from "@/services/team/invitationEmailService";

export function useTeamInvitation() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async (inviteEmail: string) => {
    setError(null);
    
    const validationError = validateInvitationEmail(inviteEmail);
    if (validationError) {
      setError(validationError);
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

      // Get or create organization
      const { organizationId, companyName } = await getOrCreateOrganization(user.id);

      // Check for existing invitations
      await checkExistingInvitation(inviteEmail, organizationId);

      // Create the invitation
      const inviteData = await createInvitation(inviteEmail, organizationId, user.id);

      // Send email invitation
      try {
        await sendInvitationEmail(inviteEmail, companyName, inviteData.token, user.id, inviteData.id);
      } catch (emailError: any) {
        console.error("7. ERROR: Email sending failed:", emailError);
        console.error("Email error details:", emailError.message);
        // Don't fail the whole process if email fails, but show a warning
        toast.error("Invitation created but email failed to send. Please contact the user directly.");
        return true; // Still return success since invitation was created
      }
      
      console.log("=== INVITATION PROCESS COMPLETE ===");
      
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
