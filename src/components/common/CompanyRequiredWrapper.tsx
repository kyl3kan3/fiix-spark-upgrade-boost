
import React, { useEffect, useState, useCallback } from "react";
import { useCompanyStatus } from "@/hooks/company/useCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Add loading timeout to prevent getting stuck in loading state - reduced to 5 seconds
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        toast.warning("Loading profile data timed out. Continuing with limited functionality.");
        
        // Force a refresh if we're stuck in loading state for too long
        if (Date.now() - lastRefreshTime > 10000) { // If it's been more than 10 seconds since last refresh
          refreshCompanyStatus();
          setLastRefreshTime(Date.now());
        }
      }, 5000); // 5 seconds timeout (reduced from 10)
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, loadingTimeout, lastRefreshTime, refreshCompanyStatus]);

  // Check database status on mount and when forceRender changes
  useEffect(() => {
    console.log("CompanyRequiredWrapper: Refreshing company status");
    refreshCompanyStatus();
    setLastRefreshTime(Date.now());
  }, [refreshCompanyStatus, forceRender]);
  
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
    if (!isSetupPath && redirectAttempts < 2 && !setupComplete && !companyId && !isLoading) {
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

  // Retry button handler
  const handleForceRefresh = useCallback(() => {
    setForceRender(prev => !prev);
    refreshCompanyStatus();
    setLastRefreshTime(Date.now());
    toast.info("Refreshing company status...");
  }, [refreshCompanyStatus]);

  // Wait for both profile data and setup check to complete
  // But don't wait forever if there's a timeout
  if (isLoading && !loadingTimeout) {
    return <LoadingDisplay />;
  }

  // Debug log to help track the issue
  console.log("CompanyRequiredWrapper state:", { 
    setupComplete, 
    hasCompanyId: !!companyId, 
    companyId,
    redirectAttempts,
    path: location.pathname,
    isAuthenticated,
    loadingTimeout
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

  // If loading timed out, allow access to prevent being stuck
  if (loadingTimeout) {
    toast.warning("Some features may be limited due to profile loading issues.");
    return <>{children}</>;
  }

  // Special case for profile page - always allow access
  if (location.pathname === "/profile") {
    console.log("Profile page access granted regardless of company status");
    return <>{children}</>;
  }

  // If we have a company_id, allow access
  if (companyId) {
    console.log("Company ID exists, allowing access");
    return <>{children}</>;
  }

  // If setup is explicitly marked as complete, allow access
  if (setupComplete === true) {
    console.log("Setup is marked as complete, allowing access");
    return <>{children}</>;
  }

  // Avoid infinite loops - if we've tried to redirect too many times, just show the children
  if (redirectAttempts >= 2) {
    console.warn("Detected potential redirect loop. Bypassing setup check.");
    return <>{children}</>;
  }

  // Otherwise show the setup required page
  return (
    <SetupRequiredDisplay
      profileError={profileError}
      onCompanyFound={handleCompanyFound}
      onProfileFixed={handleForceRefresh}
    />
  );
};

export default CompanyRequiredWrapper;
