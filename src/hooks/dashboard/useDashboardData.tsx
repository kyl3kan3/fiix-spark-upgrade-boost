
import { useState, useEffect } from "react";
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
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoadingData) {
        setIsLoadingData(false);
        setLoadingError("Loading timed out. Please refresh the page.");
        toast.error("Loading timed out", {
          description: "Dashboard data couldn't be loaded. Please refresh and try again."
        });
      }
    }, 8000); // Reduced from 15 seconds to 8 seconds

    setLoadingTimeout(timeout);
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

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
        setIsLoadingData(false);
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    };

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
