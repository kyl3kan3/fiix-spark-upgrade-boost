
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendEmailNotification } from "@/services/notifications/notificationSenders";

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

      // Get company name for the invitation email
      console.log("3. Fetching company information...");
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", profile.company_id)
        .single();
      
      if (companyError) {
        console.error("3. FAILED: Error fetching company:", companyError);
        throw new Error(`Failed to fetch company information: ${companyError.message}`);
      }

      console.log("3. SUCCESS: Company information fetched", { companyName: company?.name });

      // Check if organization already exists
      console.log("4. Checking if organization exists...");
      const { data: existingOrg, error: orgCheckError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (orgCheckError) {
        console.error("4. FAILED: Error checking organization:", orgCheckError);
        throw new Error(`Failed to check organization: ${orgCheckError.message}`);
      }

      let organizationId = profile.company_id;

      // If organization doesn't exist, create it
      if (!existingOrg) {
        console.log("4. Organization doesn't exist, creating it...");
        
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
          console.error("4. FAILED: Error creating organization:", createOrgError);
          throw new Error(`Failed to create organization: ${createOrgError.message}`);
        }
        
        organizationId = newOrg.id;
        console.log("4. SUCCESS: Created organization:", organizationId);
      } else {
        console.log("4. SUCCESS: Organization exists:", existingOrg.id);
      }

      // Check if user already has an invitation pending
      console.log("5. Checking for existing invitations...");
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from("organization_invitations")
        .select("id, status")
        .eq("email", inviteEmail)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .maybeSingle();

      if (inviteCheckError) {
        console.error("5. FAILED: Error checking existing invitations:", inviteCheckError);
        throw new Error(`Failed to check existing invitations: ${inviteCheckError.message}`);
      }

      if (existingInvite) {
        console.log("5. FAILED: Found existing pending invitation:", existingInvite);
        throw new Error("An invitation for this email is already pending");
      }

      console.log("5. SUCCESS: No existing invitations found");

      // Create the invitation with detailed logging
      console.log("6. Creating new invitation...");
      const invitationData = {
        email: inviteEmail,
        organization_id: organizationId,
        invited_by: user.id,
        role: "technician",
        token: crypto.randomUUID(),
        status: "pending"
      };

      console.log("6. About to insert invitation with data:", invitationData);

      const { data: inviteData, error: inviteError } = await supabase
        .from("organization_invitations")
        .insert(invitationData)
        .select()
        .single();

      if (inviteError) {
        console.error("6. FAILED: Database error creating invitation:", inviteError);
        console.error("Error details:", {
          code: inviteError.code,
          message: inviteError.message,
          details: inviteError.details,
          hint: inviteError.hint
        });
        throw new Error(`Failed to create invitation: ${inviteError.message}`);
      }

      if (!inviteData) {
        console.error("6. FAILED: No invitation data returned from insert");
        throw new Error("Failed to create invitation - no data returned");
      }

      console.log("6. SUCCESS: Invitation created successfully:", inviteData);

      // Send actual email invitation
      console.log("7. Sending invitation email...");
      try {
        const inviteUrl = `${window.location.origin}/auth?signup=true&token=${inviteData.token}`;
        const emailSubject = `You're invited to join ${company?.name || 'the team'} on MaintenEase`;
        const emailBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're invited to join ${company?.name || 'the team'}!</h2>
            <p>Hello,</p>
            <p>You've been invited to join <strong>${company?.name || 'the team'}</strong> on MaintenEase, a maintenance management platform.</p>
            <p>Click the link below to accept your invitation and create your account:</p>
            <p style="margin: 20px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
            <p>This invitation will expire in 7 days.</p>
            <p>Best regards,<br>The MaintenEase Team</p>
          </div>
        `;

        console.log("7. Calling sendEmailNotification with:", {
          to: inviteEmail,
          subject: emailSubject,
          userId: user.id,
          invitationId: inviteData.id
        });

        await sendEmailNotification(inviteEmail, emailSubject, emailBody, user.id, inviteData.id);
        console.log("7. SUCCESS: Email sent successfully to:", inviteEmail);
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
