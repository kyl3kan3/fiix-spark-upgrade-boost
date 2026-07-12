
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "./AuthLayout";
import { AuthContent } from "./AuthContent";
import { useAuth } from "@/hooks/auth";
import { useAuthErrorHandler } from "@/hooks/auth/useAuthErrorHandler";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import AuthLoader from "./AuthLoader";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/utils/storageUtils";

export const AuthContainer: React.FC = () => {
 const location = useLocation();
 const navigate = useNavigate();
 const [isSignUp, setIsSignUp] = useState(false);
 const { isAuthenticated, isLoading } = useAuth();
 const { error, handleError, clearError } = useAuthErrorHandler();
 const { redirectToDashboard } = useAuthNavigation();

 // Redirect if already authenticated
 useEffect(() => {
 if (!isLoading && isAuthenticated) {
 // If a pending invite token is present, send the user to onboarding
 // so the invitation can be accepted before landing on the dashboard.
      const hasPendingInvite = !!getStorageItem("pending_invite_token");
  const params = new URLSearchParams(location.search);
  const nextParam = params.get("next");
  // Only accept same-origin relative paths for `next`.
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;
  const from = safeNext || location.state?.from?.pathname || "/dashboard";
 navigate(hasPendingInvite ? "/onboarding" : from, { replace: true });
 }
 }, [isAuthenticated, isLoading, navigate, location.search, location.state]);

 // Check for stored auth errors
 useEffect(() => {
    const storedError = getStorageItem(AUTH_STORAGE_KEYS.AUTH_ERROR);
 if (storedError) {
 handleError(storedError);
      removeStorageItem(AUTH_STORAGE_KEYS.AUTH_ERROR);
 }
 }, [handleError]);

 // Check if we should default to signup mode
 useEffect(() => {
 const params = new URLSearchParams(location.search);
 if (params.get("signup") === "true") {
 setIsSignUp(true);
 }

 // Handle invitation token from email link
 const token = params.get("token");
 if (token) {
 setIsSignUp(true);
      setStorageItem("pending_invite_token", token);
 (async () => {
 const { data: invitations } = await supabase
 .rpc("get_invitation_by_token", { _token: token });
 const invitation = invitations?.[0];

 if (!invitation) {
 toast.error("Invitation not found", {
 description: "This link is invalid or has already been used.",
 });
          removeStorageItem("pending_invite_token");
 return;
 }
 if (invitation.status !== "pending") {
 toast.info("This invitation has already been accepted.");
          removeStorageItem("pending_invite_token");
 return;
 }
 if (invitation.email) {
          setStorageItem(AUTH_STORAGE_KEYS.PENDING_EMAIL, invitation.email);
        // Notify the auth form that a pending email is now available,
        // since useFormState only reads localStorage on its first render.
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("pending-email-resolved", { detail: invitation.email })
          );
        }
 }
          const companyName = (invitation as any).company_name as string | null;
          if (companyName) {
            setStorageItem("pending_invite_company", companyName);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("pending-invite-company-resolved", { detail: companyName })
              );
            }
          }
          toast.success(
            companyName ? `You're invited to join ${companyName}` : "You're invited!",
            {
              description: `Create your account with ${invitation.email} to continue.`,
            }
          );
 })();
 }

 clearError();
 }, [location, clearError]);

 const handleToggleMode = () => {
 setIsSignUp(!isSignUp);
 clearError();
 };

 // Show loading state while checking auth
 if (isLoading) {
 return (
 <AuthLoader 
 title="Checking Authentication" 
 message="Please wait while we verify your login status..." 
 />
 );
 }

 return (
 <AuthLayout>
 <AuthContent 
 isSignUp={isSignUp}
 error={error}
 onError={handleError}
 onToggleMode={handleToggleMode}
 />
 </AuthLayout>
 );
};
