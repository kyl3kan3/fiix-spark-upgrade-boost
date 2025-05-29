
import { supabase } from "@/integrations/supabase/client";

export async function checkExistingInvitation(email: string, organizationId: string) {
  console.log("=== CHECKING EXISTING INVITATIONS ===");
  console.log("Checking for existing invitations with:", { email, organizationId });
  
  const { data: existingInvites, error: inviteCheckError } = await supabase
    .from("organization_invitations")
    .select("id, status, created_at")
    .eq("email", email)
    .eq("organization_id", organizationId);

  console.log("Raw query result:", { existingInvites, inviteCheckError });

  if (inviteCheckError) {
    console.error("Database error checking existing invitations:", inviteCheckError);
    throw new Error(`Failed to check existing invitations: ${inviteCheckError.message}`);
  }

  // Filter for pending invitations
  const pendingInvites = existingInvites?.filter(invite => invite.status === "pending") || [];
  console.log("Pending invitations found:", pendingInvites);

  if (pendingInvites.length > 0) {
    console.log("Found pending invitation, throwing error");
    throw new Error("An invitation for this email is already pending");
  }

  console.log("No pending invitations found, proceeding");
}

export async function getExistingInvitation(email: string, organizationId: string) {
  console.log("=== GETTING EXISTING INVITATION FOR RESEND ===");
  console.log("Looking for existing invitation with:", { email, organizationId });
  
  const { data: existingInvite, error: inviteGetError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("email", email)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .maybeSingle();

  console.log("Existing invitation query result:", { existingInvite, inviteGetError });

  if (inviteGetError) {
    console.error("Database error getting existing invitation:", inviteGetError);
    throw new Error(`Failed to get existing invitation: ${inviteGetError.message}`);
  }

  return existingInvite;
}

export async function createInvitation(email: string, organizationId: string, userId: string) {
  console.log("=== CREATING NEW INVITATION ===");
  const invitationData = {
    email,
    organization_id: organizationId,
    invited_by: userId,
    role: "technician",
    token: crypto.randomUUID(),
    status: "pending"
  };

  console.log("About to insert invitation with data:", invitationData);

  const { data: inviteData, error: inviteError } = await supabase
    .from("organization_invitations")
    .insert(invitationData)
    .select()
    .single();

  if (inviteError) {
    console.error("Database error creating invitation:", inviteError);
    console.error("Error details:", {
      code: inviteError.code,
      message: inviteError.message,
      details: inviteError.details,
      hint: inviteError.hint
    });
    throw new Error(`Failed to create invitation: ${inviteError.message}`);
  }

  if (!inviteData) {
    console.error("No invitation data returned from insert");
    throw new Error("Failed to create invitation - no data returned");
  }

  console.log("Invitation created successfully:", inviteData);
  return inviteData;
}

export async function deleteInvitation(invitationId: string): Promise<void> {
  console.log("=== DELETING INVITATION ===");
  console.log("Deleting invitation with ID:", invitationId);
  
  const { error } = await supabase
    .from("organization_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    console.error("Failed to delete invitation:", error);
    throw new Error(`Failed to delete invitation: ${error.message}`);
  }

  console.log("Successfully deleted invitation:", invitationId);
}
