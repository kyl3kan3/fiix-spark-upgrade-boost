
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
      const { data, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
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
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", organizationId)
        .maybeSingle();
        
      if (orgError) {
        throw new Error(`Error checking organization: ${orgError.message}`);
      }
      
      // If organization doesn't exist, create one from company data
      if (!org) {
        // Get company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", organizationId)
          .single();
          
        if (companyError) {
          throw new Error(`Could not find company: ${companyError.message}`);
        }
        
        // Create organization with same ID as company
        const { error: createOrgError } = await supabase
          .from("organizations")
          .insert({
            id: organizationId,
            name: company.name
          });
          
        if (createOrgError) {
          throw new Error(`Error creating organization: ${createOrgError.message}`);
        }
        
        console.log("Created missing organization record for company:", organizationId);
      }

      // Generate a secure random token for invite
      const token = generateToken();

      // Send the invitation
      const { data, error } = await supabase
        .from("organization_invitations")
        .insert([
          {
            organization_id: organizationId,
            email,
            role,
            invited_by: currentUserId,
            token,
          }
        ])
        .select()
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return null;
      }
      
      // Add to current list
      setInvitations((prev) => [data as OrganizationInvitation, ...prev]);
      setLoading(false);
      return data as OrganizationInvitation;
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.message);
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
