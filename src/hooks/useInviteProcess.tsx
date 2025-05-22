
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useInviteProcess = () => {
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Extract the invite token from the URL path if present
  const extractInviteTokenFromPath = (path: string) => {
    if (path.startsWith("/invite/")) {
      const token = path.replace("/invite/", "");
      if (token) {
        setInviteToken(token);
        handleInviteToken(token);
        return token;
      }
    }
    return null;
  };

  const handleInviteToken = async (token: string) => {
    setIsProcessingInvite(true);
    try {
      // Look up the invitation
      const { data: invitation, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!invitation) {
        setAuthError("Invalid or expired invitation link");
        return;
      }
      
      // Store the email to pre-fill the form
      if (invitation.email) {
        localStorage.setItem("pending_auth_email", invitation.email);
      }
      
      toast.info("Please sign up to accept the invitation");
      
    } catch (error) {
      console.error("Error processing invite:", error);
      setAuthError("Error processing invitation");
    } finally {
      setIsProcessingInvite(false);
    }
  };

  const handleInviteAccept = async (token: string, email: string) => {
    try {
      // Find the invitation
      const { data: invitation, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
        
      if (error || !invitation) {
        throw new Error("Invalid or expired invitation");
      }
      
      // Check if the email matches
      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error("This invitation is for a different email address");
      }
      
      // Update invitation status
      localStorage.setItem("pending_invitation", JSON.stringify(invitation));
      
      // Redirect to onboarding to complete the process
      navigate("/onboarding");
      
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to process invitation");
    }
  };

  return {
    inviteToken,
    setInviteToken,
    isProcessingInvite,
    authError,
    setAuthError,
    extractInviteTokenFromPath,
    handleInviteToken,
    handleInviteAccept
  };
};
