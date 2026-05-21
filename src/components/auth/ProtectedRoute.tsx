
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";
import { SubscriptionStatusBanner } from "@/components/billing/SubscriptionStatusBanner";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/profile/useProfile";

interface ProtectedRouteProps {
 children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
 const { isAuthenticated, isLoading } = useAuth();
 const location = useLocation();
 const { data: sub, isLoading: subLoading } = useSubscription();
  const { profile, isLoading: profileLoading } = useProfile();

 // Show loading spinner while checking authentication
 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-muted">
 <div className="text-center">
 <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
 <p className="mt-4 text-foreground">Verifying authentication...</p>
 </div>
 </div>
 );
 }

 // Redirect to auth page if not authenticated, preserving the intended destination
 if (!isAuthenticated) {
 return <Navigate to="/auth" state={{ from: location }} replace />;
 }

  // Force users without a company to complete onboarding before using the app.
  const ONBOARDING_ALLOWED = ["/onboarding", "/company-setup", "/setup", "/auth"];
  const onOnboardingPath = ONBOARDING_ALLOWED.some((p) => location.pathname.startsWith(p));
  if (isAuthenticated && !profileLoading && profile && !profile.company_id && !onOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

 // Hard-lock the app when subscription is inactive (expired trial, canceled, past due final).
 // Always allow billing, pricing, profile, settings, onboarding & company setup so the user can recover.
 const ALLOWED_WHEN_INACTIVE = [
 "/billing", "/pricing", "/profile", "/settings",
 "/onboarding", "/company-setup", "/setup", "/team-setup",
 ];
 const isAllowed = ALLOWED_WHEN_INACTIVE.some((p) => location.pathname.startsWith(p));
 if (!subLoading && sub && !sub.is_active && !isAllowed) {
 return <Navigate to="/billing?inactive=1" replace />;
 }

 // Render the protected content if authenticated
 return (
 <>
 <SubscriptionStatusBanner />
 {children}
 </>
 );
};

export default ProtectedRoute;
