
import { useState, useEffect } from "react";
import {
 insertOrganizationInvitation,
 listOrganizationInvitations,
} from "@/services/team/invitationService";
import {
 createOrganizationFromCompany,
 getOrganizationById,
} from "@/services/team/organizationService";

export interface OrganizationInvitation {
 id: string;
 organization_id: string;
 email: string;
 invited_by: string;
 role: string;
 status: string;
 created_at: string;
 accepted_at: string | null;
 token: string | null;
}

function generateToken(length = 32) {
 // Generates a random hex string (32 characters)
 const arr = new Uint8Array(length / 2);
 window.crypto.getRandomValues(arr);
 return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Now takes currentUserId
export const useOrganizationInvitations = (
 organizationId: string | null,
 currentUserId: string | null
) => {
 const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Fetch invitations (now also retrieves the token)
 useEffect(() => {
 const fetchInvitations = async () => {
 if (!organizationId) return;
 setLoading(true);
 try {
 const data = await listOrganizationInvitations(organizationId);
 setInvitations(data as OrganizationInvitation[]);
 setError(null);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Failed to load invitations");
 setInvitations([]);
 }
 setLoading(false);
 };
 fetchInvitations();
 }, [organizationId]);

 // Send an invitation, now requires currentUserId and adds a token
 const sendInvitation = async (
 email: string,
 role: string = "technician"
 ) => {
 if (!organizationId) {
 setError("No organization selected");
 return null;
 }
 if (!currentUserId) {
 setError("No current user ID found");
 return null;
 }

 setLoading(true);

 try {
 // First ensure the organization exists in the organizations table
 let org;
 try {
 org = await getOrganizationById(organizationId);
 } catch (orgError) {
 const message = orgError instanceof Error ? orgError.message : String(orgError);
 throw new Error(`Error checking organization: ${message}`);
 }

 // If organization doesn't exist, create one from company data
 if (!org) {
 await createOrganizationFromCompany(organizationId);
 }

 // Generate a secure random token for invite
 const token = generateToken();

 // Send the invitation
 const data = await insertOrganizationInvitation({
 organizationId,
 email,
 role,
 invitedBy: currentUserId,
 token,
 });

 // Add to current list
 setInvitations((prev) => [data as OrganizationInvitation, ...prev]);
 setLoading(false);
 return data as OrganizationInvitation;
 } catch (err) {
 console.error("Error sending invitation:", err);
 setError(err instanceof Error ? err.message : "Failed to send invitation");
 setLoading(false);
 return null;
 }
 };

 return {
 invitations,
 loading,
 error,
 sendInvitation,
 };
};
