
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizationInvitations } from "@/hooks/useOrganizationInvitations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationInviteFormProps {
  organizationId: string;
}

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

  const { sendInvitation, loading } = useOrganizationInvitations(organizationId, currentUserId);

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

  return (
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
  );
};

export default OrganizationInviteForm;
