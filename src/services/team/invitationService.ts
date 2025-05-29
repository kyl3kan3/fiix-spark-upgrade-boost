
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

export async function getExistingInvitation(email: string, organizationId: string) {
  console.log("3. Getting existing invitation for resend...");
  const { data: existingInvite, error: inviteGetError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("email", email)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .maybeSingle();

  if (inviteGetError) {
    console.error("3. FAILED: Error getting existing invitation:", inviteGetError);
    throw new Error(`Failed to get existing invitation: ${inviteGetError.message}`);
  }

  return existingInvite;
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

export async function deleteInvitation(invitationId: string): Promise<void> {
  console.log("Starting delete process for invitation ID:", invitationId);
  
  // First, let's check if the invitation exists and get current user info
  const { data: currentUser, error: userError } = await supabase.auth.getUser();
  
  if (userError || !currentUser?.user) {
    console.error("Failed to get current user:", userError);
    throw new Error("Authentication required to delete invitation");
  }
  
  console.log("Current user ID:", currentUser.user.id);
  
  // Check if the invitation exists
  const { data: invitation, error: checkError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();
    
  if (checkError) {
    console.error("Error checking invitation:", checkError);
    throw new Error(`Failed to verify invitation: ${checkError.message}`);
  }
  
  if (!invitation) {
    console.error("Invitation not found with ID:", invitationId);
    throw new Error("Invitation not found");
  }
  
  console.log("Found invitation to delete:", invitation);
  
  // Attempt to delete the invitation
  const { error: deleteError, data: deleteData } = await supabase
    .from("organization_invitations")
    .delete()
    .eq("id", invitationId)
    .select();

  console.log("Delete operation result:", { deleteError, deleteData });

  if (deleteError) {
    console.error("Failed to delete invitation:", deleteError);
    console.error("Delete error details:", {
      code: deleteError.code,
      message: deleteError.message,
      details: deleteError.details,
      hint: deleteError.hint
    });
    throw new Error(`Failed to delete invitation: ${deleteError.message}`);
  }

  if (!deleteData || deleteData.length === 0) {
    console.error("No rows were deleted. This might indicate a permission issue.");
    throw new Error("Failed to delete invitation - no rows affected");
  }

  console.log("Successfully deleted invitation:", invitationId);
}
