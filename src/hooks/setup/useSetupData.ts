
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

interface SetupData {
  companyName: string;
  industry: string;
  size: string;
  primaryGoals: string[];
  locations: Array<{ name: string; address: string }>;
  userRoles: Array<{ name: string; permissions: string[] }>;
  maintenanceTypes: string[];
  assetCategories: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  dashboardLayout: string;
  integrations: string[];
}

const defaultSetupData: SetupData = {
  companyName: "",
  industry: "",
  size: "",
  primaryGoals: [],
  locations: [],
  userRoles: [],
  maintenanceTypes: [],
  assetCategories: [],
  notifications: {
    email: true,
    sms: false,
    inApp: true,
  },
  dashboardLayout: "default",
  integrations: [],
};

export function useSetupData() {
  const { user } = useAuth();
  const [setupData, setSetupData] = useState<SetupData>(defaultSetupData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Check for existing company data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id, company_name")
        .eq("id", user.id)
        .single();

      if (profileData?.company_name) {
        setSetupData(prev => ({
          ...prev,
          companyName: profileData.company_name
        }));
      }

      // Check for stored setup data in session storage
      const storedData = sessionStorage.getItem('edit_company_info');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setSetupData(prev => ({
          ...prev,
          companyName: parsedData.companyName || "",
          industry: parsedData.industry || "",
          size: parsedData.size || ""
        }));
        sessionStorage.removeItem('edit_company_info');
      }
    } catch (error) {
      console.error("Error fetching setup data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const updateSetupData = useCallback((updates: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    setupData,
    updateSetupData,
    isLoading,
    refreshData: fetchExistingData
  };
}
