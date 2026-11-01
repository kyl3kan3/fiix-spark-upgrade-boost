
import { supabase } from "@/integrations/supabase/client";

/** Lists all invitations for an organization, newest first. Throws on error. */
export async function listOrganizationInvitations(organizationId: string) {
 const { data, error } = await supabase
 .from("organization_invitations")
 .select("*")
 .eq("organization_id", organizationId)
 .order("created_at", { ascending: false });

 if (error) throw error;
 return data;
}

export interface OrganizationInvitationInsert {
 organizationId: string;
 email: string;
 role: string;
 invitedBy: string;
 token: string;
}

/** Inserts a new organization invitation and returns the created row. Throws on error. */
export async function insertOrganizationInvitation(input: OrganizationInvitationInsert) {
 const { data, error } = await supabase
 .from("organization_invitations")
 .insert([
 {
 organization_id: input.organizationId,
 email: input.email,
 role: input.role,
 invited_by: input.invitedBy,
 token: input.token,
 }
 ])
 .select()
 .single();

 if (error) throw error;
 return data;
}

/** Looks up the invitations matching an invite token. Throws on error. */
export async function getInvitationsByToken(token: string) {
 const { data, error } = await supabase
 .rpc("get_invitation_by_token", { _token: token });

 if (error) throw error;
 return data;
}

export async function checkExistingInvitation(email: string, organizationId: string) {
 const { data: existingInvites, error: inviteCheckError } = await supabase
 .from("organization_invitations")
 .select("id, status, created_at")
 .eq("email", email)
 .eq("organization_id", organizationId)
 .order('created_at', { ascending: false });

 if (inviteCheckError) {
 console.error("Database error checking existing invitations:", inviteCheckError);
 throw new Error(`Failed to check existing invitations: ${inviteCheckError.message}`);
 }

 const pendingInvites = existingInvites?.filter(invite => invite.status === "pending") || [];

 if (pendingInvites.length > 0) {
 throw new Error("An invitation for this email is already pending");
 }
}

export async function getExistingInvitation(email: string, organizationId: string) {
 const { data: existingInvite, error: inviteGetError } = await supabase
 .from("organization_invitations")
 .select("*")
 .eq("email", email)
 .eq("organization_id", organizationId)
 .eq("status", "pending")
 .order('created_at', { ascending: false })
 .maybeSingle();

 if (inviteGetError) {
 console.error("Database error getting existing invitation:", inviteGetError);
 throw new Error(`Failed to get existing invitation: ${inviteGetError.message}`);
 }

 return existingInvite;
}

export async function createInvitation(email: string, organizationId: string, userId: string) {
 const invitationData = {
 email,
 organization_id: organizationId,
 invited_by: userId,
 role: "technician",
 token: crypto.randomUUID(),
 status: "pending"
 };

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

 return inviteData;
}

export async function deleteInvitation(invitationId: string): Promise<void> {
 const { error } = await supabase
 .from("organization_invitations")
 .delete()
 .eq("id", invitationId);

 if (error) {
 console.error("Failed to delete invitation:", error);
 throw new Error(`Failed to delete invitation: ${error.message}`);
 }

 await new Promise(resolve => setTimeout(resolve, 100));

 const { data: verifyDeleted, error: verifyError } = await supabase
 .from("organization_invitations")
 .select("id")
 .eq("id", invitationId)
 .maybeSingle();

 if (verifyError) {
 console.error("Error verifying deletion:", verifyError);
 } else if (verifyDeleted) {
 console.error("WARNING: Invitation still exists after deletion attempt:", verifyDeleted);
 }
}
