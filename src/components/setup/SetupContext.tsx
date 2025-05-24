
import React, { createContext, useContext, useState, useEffect } from "react";
import { loadSetupData, saveSetupData, SetupData } from "@/services/setup";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SetupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setupData: SetupData;
  updateSetupData: (section: keyof SetupData, data: any) => void;
  setupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
  isLoading: boolean;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

// Initialize with empty data
const defaultSetupData: SetupData = {
  companyInfo: {},
  userRoles: {},
  assetCategories: {},
  locations: {},
  maintenanceSchedules: {},
  notifications: {},
  integrations: {},
  dashboardCustomization: {}
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState<SetupData>(defaultSetupData);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error:", error);
          setAuthStatus('unauthenticated');
          return;
        }
        
        if (data.user) {
          console.log("User authenticated:", data.user.id);
          setAuthStatus('authenticated');
        } else {
          console.log("No authenticated user found");
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setAuthStatus('unauthenticated');
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      setAuthStatus(session ? 'authenticated' : 'unauthenticated');
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load initial data from Supabase or localStorage
  useEffect(() => {
    const fetchSetupData = async () => {
      setIsLoading(true);
      try {
        // Load data from Supabase (falls back to localStorage)
        const data = await loadSetupData();
        console.log("Loaded setup data:", data);
        setSetupData(data);
        
        // Check if setup is complete
        const isComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
        console.log("Setup complete from localStorage:", isComplete);
        setSetupComplete(isComplete);
      } catch (error) {
        console.error("Error initializing setup data:", error);
        toast.error("Failed to load setup data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  // Update setup data in state and save to Supabase and localStorage
  const updateSetupData = async (section: keyof SetupData, data: any) => {
    console.log(`Updating section ${String(section)} with data:`, data);
    
    try {
      setSetupData(prev => {
        // Ensure we're using the correct camelCase key
        const normalizedSection = section.charAt(0).toLowerCase() + section.slice(1) as keyof SetupData;
        
        const updatedData = {
          ...prev,
          [normalizedSection]: data
        };
        
        console.log(`Updated ${String(normalizedSection)} in setupData:`, data);
        
        // Save to Supabase and localStorage asynchronously
        saveSetupData(updatedData, setupComplete).catch(error => {
          console.error(`Error saving ${String(normalizedSection)}:`, error);
          toast.error(`Failed to save ${String(normalizedSection)} data`);
        });
        
        return updatedData;
      });
    } catch (error) {
      console.error(`Error in updateSetupData for section ${String(section)}:`, error);
      toast.error(`Failed to update ${String(section)} data`);
    }
  };

  // Update setup completion status in state and save to Supabase and localStorage
  useEffect(() => {
    const updateCompletionStatus = async () => {
      // Don't update if we're still loading
      if (isLoading) return;
      
      try {
        await saveSetupData(setupData, setupComplete);
        console.log("Updated completion status:", setupComplete);
        
        // Also update the localStorage flag
        if (setupComplete) {
          localStorage.setItem('maintenease_setup_complete', 'true');
          console.log("Setup marked as complete in localStorage");
        }
      } catch (error) {
        console.error("Error updating setup completion status:", error);
        toast.error("Failed to update setup completion status");
      }
    };
    
    updateCompletionStatus();
  }, [setupComplete, setupData, isLoading]);

  return (
    <SetupContext.Provider value={{
      currentStep,
      setCurrentStep,
      setupData,
      updateSetupData,
      setupComplete,
      setSetupComplete,
      isLoading,
      authStatus
    }}>
      {children}
    </SetupContext.Provider>
  );
};

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
};
