
import { supabase } from "@/integrations/supabase/client";

export async function checkExistingInvitation(email: string, organizationId: string) {
  console.log("5. Checking for existing invitations...");
  const { data: existingInvite, error: inviteCheckError } = await supabase
    .from("organization_invitations")
    .select("id, status")
    .eq("email", email)
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
}

export async function createInvitation(email: string, organizationId: string, userId: string) {
  console.log("6. Creating new invitation...");
  const invitationData = {
    email,
    organization_id: organizationId,
    invited_by: userId,
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
  return inviteData;
}
