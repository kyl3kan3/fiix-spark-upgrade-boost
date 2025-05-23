
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizationInvitations } from "@/hooks/useOrganizationInvitations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationInviteFormProps {
  organizationId: string;
}

const INVITE_URL_PREFIX = window.location.origin + "/invite/";

export const OrganizationInviteForm: React.FC<OrganizationInviteFormProps> = ({ organizationId }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("technician");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch user id on mount
  useEffect(() => {
    async function fetchUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    fetchUserId();
  }, []);

  // Ensure organization exists by checking the organizations table
  useEffect(() => {
    async function checkOrCreateOrganization() {
      if (!organizationId) return;
      
      try {
        // Check if organization exists
        const { data: org, error } = await supabase
          .from("organizations")
          .select("id")
          .eq("id", organizationId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking organization:", error);
          return;
        }
          
        // If organization doesn't exist, create it
        if (!org) {
          // Get the company info
          const { data: company } = await supabase
            .from("companies")
            .select("name")
            .eq("id", organizationId)
            .single();
            
          if (company) {
            // Create organization with same ID as company
            await supabase
              .from("organizations")
              .insert({
                id: organizationId,
                name: company.name
              });
              
            console.log("Created missing organization record for company:", organizationId);
          }
        }
      } catch (err) {
        console.error("Error checking/creating organization:", err);
      }
    }
    
    checkOrCreateOrganization();
  }, [organizationId]);

  const { sendInvitation, loading, invitations, error } = useOrganizationInvitations(organizationId, currentUserId);

  // Log fetched invitations for debugging
  useEffect(() => {
    console.log('[OrganizationInviteForm] Fetched invitations:', invitations);
  }, [invitations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const result = await sendInvitation(email, role);
    if (result) {
      toast.success("Invitation sent!");
      setEmail("");
    } else {
      toast.error("Failed to send invitation.");
    }
  };

  // Show only pending invitations (optionally add filter for invites created by this user)
  const pendingInvites = invitations.filter(inv => inv.status === "pending");

  // Simple copy-to-clipboard for invite links
  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Input
          type="email"
          placeholder="Invite email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading || !currentUserId}
        />
        {/* You could add a role selector here if you want to support more roles */}
        <Button type="submit" disabled={loading || !currentUserId}>
          Send Invite
        </Button>
      </form>

      {/* Show pending invites section */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-gray-700">Pending Invitations</h3>
        {pendingInvites.length === 0 && (
          <div className="text-sm text-gray-500">No pending invites.</div>
        )}
        <ul className="divide-y rounded border bg-white mt-2">
          {pendingInvites.map(invite => (
            <li key={invite.id} className="flex flex-col md:flex-row md:items-center justify-between py-2 px-3">
              <div>
                <span className="font-medium">{invite.email}</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{invite.role}</span>
              </div>
              {invite.token && (
                <div className="flex items-center mt-2 md:mt-0">
                  <Input
                    className="w-56 mr-2"
                    value={INVITE_URL_PREFIX + invite.token}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(INVITE_URL_PREFIX + invite.token)}
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrganizationInviteForm;
