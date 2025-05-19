
import React, { useEffect, useState } from "react";
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
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      console.log("User is not authenticated, redirecting to auth page");
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Check database status on mount only - removing dependency array to prevent refresh loops
  useEffect(() => {
    // Only refresh on initial load
    if (isInitialLoad) {
      refreshCompanyStatus();
      setIsInitialLoad(false);
    }
  }, [refreshCompanyStatus, isInitialLoad]); 
  
  // Anti-loop protection
  useEffect(() => {
    const isSetupPath = location.pathname === "/setup";
    
    // If we're not on the setup page but should be redirecting there, track attempts
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

  // Handle redirection to setup if needed
  useEffect(() => {
    const isSetupPath = location.pathname === "/setup";
    const isAuthPath = location.pathname === "/auth";
    
    // Don't redirect to setup from auth page
    if (isAuthPath) {
      return;
    }
    
    // Force redirect to setup if not complete and not already on setup page
    if (!isLoading && !isSetupPath && !setupComplete && !companyId && redirectAttempts < 3 && !hasRedirected) {
      console.log("Redirecting to setup page from:", location.pathname);
      setHasRedirected(true);
      toast.info("Please complete company setup first");
      navigate("/setup", { replace: true });
    }
  }, [isLoading, setupComplete, companyId, location.pathname, navigate, redirectAttempts, hasRedirected]);

  // Explicitly set the setupComplete flag in localStorage if we have a company ID
  // But only do this ONCE, not on every render
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
    return <LoadingDisplay message="Loading your profile..." />;
  }

  // If we need to redirect to auth, don't render anything else
  if (isAuthenticated === false) {
    return <LoadingDisplay message="Redirecting to login..." />;
  }

  // Debug log to help track the issue
  console.log("CompanyRequiredWrapper state:", { 
    setupComplete, 
    hasCompanyId: !!companyId, 
    companyId,
    redirectAttempts,
    path: location.pathname,
    hasRedirected,
    isAuthenticated
  });

  // If we have a company_id and setup is complete, allow access
  if (companyId && setupComplete) {
    console.log("Company ID exists and setup is complete, allowing access");
    return <>{children}</>;
  }
  
  // If we have a company ID but setup isn't marked complete, mark it complete now
  if (companyId && !setupComplete) {
    console.log("Company ID exists but setup not marked complete, updating flag");
    return <LoadingDisplay message="Finalizing setup..." />;
  }

  // Avoid infinite loops - if we've tried to redirect too many times, just show the children
  if (redirectAttempts >= 3) {
    console.warn("Detected potential redirect loop. Bypassing setup check.");
    return <>{children}</>;
  }
  
  // If we're on the setup page, always show the children (the setup UI)
  if (location.pathname === "/setup") {
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
