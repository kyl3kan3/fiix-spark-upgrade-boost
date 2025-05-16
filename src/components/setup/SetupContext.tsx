
import React, { createContext, useContext, useState, useEffect } from "react";
import { loadSetupData, saveSetupData, SetupData } from "@/services/setupService";
import { toast } from "sonner";

interface SetupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setupData: SetupData;
  updateSetupData: (section: keyof SetupData, data: any) => void;
  setupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
  isLoading: boolean;
}

// Initialize with empty data
const initialSetupData: SetupData = {
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
  const [setupData, setSetupData] = useState<SetupData>(initialSetupData);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from Supabase or localStorage
  useEffect(() => {
    const fetchSetupData = async () => {
      setIsLoading(true);
      try {
        // Load data from Supabase (falls back to localStorage)
        const data = await loadSetupData();
        setSetupData(data);
        
        // Check if setup is complete
        const isComplete = localStorage.getItem('maintenease_setup_complete') === 'true';
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
    setSetupData(prev => {
      // Ensure we're using the correct camelCase key
      const normalizedSection = section.charAt(0).toLowerCase() + section.slice(1) as keyof SetupData;
      
      const updatedData = {
        ...prev,
        [normalizedSection]: data
      };
      
      // Save to Supabase and localStorage asynchronously
      saveSetupData(updatedData, setupComplete).catch(error => {
        console.error(`Error saving ${normalizedSection}:`, error);
      });
      
      console.log(`Updated ${normalizedSection} in setupData:`, data);
      
      return updatedData;
    });
  };

  // Update setup completion status in state and save to Supabase and localStorage
  useEffect(() => {
    const updateCompletionStatus = async () => {
      // Don't update if we're still loading
      if (isLoading) return;
      
      try {
        await saveSetupData(setupData, setupComplete);
      } catch (error) {
        console.error("Error updating setup completion status:", error);
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
      isLoading
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
