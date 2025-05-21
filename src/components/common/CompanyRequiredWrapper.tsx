
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanyStatus } from "@/hooks/company/useCompanyStatus";
import { LoadingDisplay } from "./company-required/LoadingDisplay";
import { SetupRequiredDisplay } from "./company-required/SetupRequiredDisplay";
import { supabase } from "@/integrations/supabase/client";

interface CompanyRequiredWrapperProps {
  children: React.ReactNode;
}

const CompanyRequiredWrapper: React.FC<CompanyRequiredWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound
  } = useCompanyStatus();

  // First check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Auth check in CompanyRequiredWrapper:", data.session ? "Authenticated" : "Not authenticated");
        
        if (error || !data.session) {
          console.log("User not authenticated, redirecting to auth page");
          setIsAuthenticated(false);
          navigate("/auth");
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setIsAuthenticated(false);
        navigate("/auth");
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in CompanyRequiredWrapper:", event);
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn && event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth page");
        navigate("/auth");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Then check company status only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("CompanyRequiredWrapper: Refreshing company status");
      refreshCompanyStatus();
    }
  }, [isAuthenticated, refreshCompanyStatus]);

  // Handle profile fix
  const handleProfileFixed = () => {
    console.log("Profile fixed, refreshing company status");
    refreshCompanyStatus();
  };

  // If auth check is not complete, show loading
  if (!authChecked) {
    return <LoadingDisplay message="Checking authentication..." />;
  }

  // If not authenticated, navigation should have already happened
  if (!isAuthenticated) {
    return <LoadingDisplay message="Redirecting to login..." />;
  }

  // If company is being loaded, show loading
  if (isLoading) {
    return <LoadingDisplay message="Loading company information..." />;
  }

  // If company setup is not complete, show setup required
  if (!setupComplete || !companyId) {
    console.log("Company setup not complete or company ID missing");
    return (
      <SetupRequiredDisplay
        profileError={profileError}
        onCompanyFound={handleCompanyFound}
        onProfileFixed={handleProfileFixed}
      />
    );
  }

  // Company setup is complete, render children
  return <>{children}</>;
};

export default CompanyRequiredWrapper;
