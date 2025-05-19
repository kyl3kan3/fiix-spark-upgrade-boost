
import React, { useEffect, useState } from "react";
import { useCompanyStatus } from "@/hooks/company/useCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";
import { useNavigate, useLocation } from "react-router-dom";

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound,
    isAuthenticated
  } = useCompanyStatus();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  // Check database status on mount
  useEffect(() => {
    refreshCompanyStatus();
  }, [refreshCompanyStatus]);
  
  // Anti-loop protection
  useEffect(() => {
    const isSetupPath = location.pathname === "/setup";
    const isAuthPath = location.pathname === "/auth";
    const isProfilePath = location.pathname === "/profile";
    
    // Don't redirect from auth page, setup page, or profile page
    if (isAuthPath || isSetupPath || isProfilePath) {
      return;
    }
    
    // If we're not on these pages but should be redirecting to setup, track attempts
    if (!isSetupPath && redirectAttempts < 3 && !setupComplete && !companyId && !isLoading) {
      setRedirectAttempts(prev => prev + 1);
    }
    
    // Reset counter when conditions change
    if ((setupComplete || companyId || isSetupPath)) {
      if (redirectAttempts > 0) {
        setRedirectAttempts(0);
      }
    }
  }, [location.pathname, setupComplete, companyId, isLoading, redirectAttempts]);

  // Explicitly set the setupComplete flag in localStorage if we have a company ID
  useEffect(() => {
    if (companyId && !setupComplete) {
      localStorage.setItem('maintenease_setup_complete', 'true');
      // Force refresh of the company status to pick up the new setting
      setTimeout(() => {
        refreshCompanyStatus();
      }, 100);
    }
  }, [companyId, setupComplete, refreshCompanyStatus]);

  // Wait for both profile data and setup check to complete
  if (isLoading) {
    return <LoadingDisplay />;
  }

  // Debug log to help track the issue
  console.log("CompanyRequiredWrapper state:", { 
    setupComplete, 
    hasCompanyId: !!companyId, 
    companyId,
    redirectAttempts,
    path: location.pathname,
    isAuthenticated
  });

  // Don't restrict access on the auth page
  if (location.pathname === "/auth") {
    return <>{children}</>;
  }
  
  // If not authenticated and not on auth page, redirect to auth
  if (!isAuthenticated && location.pathname !== "/auth") {
    console.log("User not authenticated, redirecting to auth");
    navigate("/auth", { replace: true });
    return <LoadingDisplay />;
  }

  // If we have a company_id, always allow access
  if (companyId) {
    console.log("Company ID exists, allowing access");
    return <>{children}</>;
  }

  // If setup is explicitly marked as complete, allow access
  if (setupComplete === true) {
    console.log("Setup is marked as complete, allowing access");
    return <>{children}</>;
  }

  // Special case for profile page - always allow access even if company setup is not complete
  if (location.pathname === "/profile") {
    console.log("Profile page access granted regardless of company status");
    return <>{children}</>;
  }

  // Avoid infinite loops - if we've tried to redirect too many times, just show the children
  if (redirectAttempts >= 3) {
    console.warn("Detected potential redirect loop. Bypassing setup check.");
    return <>{children}</>;
  }

  // Otherwise show the setup required page
  return (
    <SetupRequiredDisplay
      profileError={profileError}
      onCompanyFound={handleCompanyFound}
      onProfileFixed={refreshCompanyStatus}
    />
  );
};

export default CompanyRequiredWrapper;
