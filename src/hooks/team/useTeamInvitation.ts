
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.company_id) {
        throw new Error("No company associated with your account");
      }

      // Find organization record matching company_id
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", profile.company_id)
        .maybeSingle();

      let organizationId = profile.company_id;
      
      // If no matching organization found, create one
      if (!organization && !orgError) {
        // Get company info to create organization
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();
        
        // Create a new organization with the same ID as company
        const { data: newOrg, error: createOrgError } = await supabase
          .from("organizations")
          .insert({
            id: profile.company_id,
            name: company?.name || "Organization"
          })
          .select()
          .single();
          
        if (createOrgError) {
          console.error("Error creating organization:", createOrgError);
          throw new Error("Failed to create organization");
        }
        
        organizationId = newOrg.id;
      }

      // Create an invitation using the organization ID
      const { error: inviteError } = await supabase
        .from("organization_invitations")
        .insert({
          email: inviteEmail,
          organization_id: organizationId,
          invited_by: user.id,
          role: "technician", // Default role for new team members
          token: crypto.randomUUID(), // Generate a random token for the invite
        });

      if (inviteError) throw inviteError;

      toast.success(`Invitation sent to ${inviteEmail}`);
      return true;
    } catch (err: any) {
      console.error("Error inviting user:", err);
      setError(err.message || "Failed to send invitation");
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
