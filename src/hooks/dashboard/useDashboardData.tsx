
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDashboardData() {
  const { user, isLoading: authLoading } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Set up timeout for data loading
  useEffect(() => {
    if (isLoadingData) {
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && isLoadingData) {
          console.log("Dashboard data loading timeout triggered");
          setIsLoadingData(false);
          setLoadingError("Loading timed out. Please refresh the page.");
          toast.error("Loading timed out", {
            description: "Dashboard data couldn't be loaded. Please refresh and try again."
          });
        }
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoadingData]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("No user found in context, stopping data fetch");
        setIsLoadingData(false);
        return;
      }

      try {
        console.log("Fetching profile data for user:", user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, role, company_id")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setLoadingError(`Error loading profile: ${error.message}`);
          setIsLoadingData(false);
          return;
        }

        const fullName = [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ");
        
        setUserName(fullName || user.email || "User");
        setRole(profile?.role || "User");

        if (profile?.company_id) {
          console.log("Fetching company data for company_id:", profile.company_id);
          const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("name")
            .eq("id", profile.company_id)
            .single();

          if (companyError) {
            console.error("Error fetching company:", companyError);
            // Don't set error here, just continue with null company name
          } else if (company) {
            setCompanyName(company.name);
          }
        }
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setLoadingError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        // Only update state if component is still mounted
        if (isMounted.current) {
          setIsLoadingData(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };

    // Start data fetch only after authentication loading is complete
    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  return {
    userName,
    companyName,
    role,
    isLoading: authLoading || isLoadingData,
    loadingError
  };
}
