
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  invited_by: string;
  role: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

export const useOrganizationInvitations = (organizationId: string | null) => {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!organizationId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("organization_id", organizationId);
      if (error) {
        setError(error.message);
        setInvitations([]);
      } else {
        setInvitations(data as OrganizationInvitation[]);
        setError(null);
      }
      setLoading(false);
    };
    fetchInvitations();
  }, [organizationId]);

  // Send an invitation
  const sendInvitation = async (email: string, role: string = "technician") => {
    if (!organizationId) {
      setError("No organization selected");
      return null;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("organization_invitations")
      .insert([{ organization_id: organizationId, email, role }])
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return null;
    }
    // Add to current list
    setInvitations(prev => [...prev, data as OrganizationInvitation]);
    return data as OrganizationInvitation;
  };

  return {
    invitations,
    loading,
    error,
    sendInvitation,
  };
};
