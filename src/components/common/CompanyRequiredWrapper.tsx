
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
  const [checkComplete, setCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound
  } = useCompanyStatus();

  // Direct check for authentication instead of using hooks
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session directly without using hooks
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setIsAuthenticated(false);
          setCheckComplete(true);
          return;
        }
        
        const authenticated = !!data.session;
        setIsAuthenticated(authenticated);
        setUserId(data.session?.user?.id || null);
        
        if (authenticated) {
          console.log("User authenticated:", data.session?.user?.id);
          refreshCompanyStatus();
        } else {
          console.log("No authenticated user found");
          navigate("/auth");
        }
        
        setCheckComplete(true);
      } catch (err) {
        console.error("Error in auth check:", err);
        setIsAuthenticated(false);
        setCheckComplete(true);
      }
    };
    
    checkAuth();
    
    // Monitor authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id || null);
      
      if (session?.user) {
        refreshCompanyStatus();
      } else if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, refreshCompanyStatus]);

  // If authentication check is not complete, show loading
  if (!checkComplete) {
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
        onProfileFixed={() => refreshCompanyStatus()}
      />
    );
  }

  // Company setup is complete, render children
  return <>{children}</>;
};

export default CompanyRequiredWrapper;
