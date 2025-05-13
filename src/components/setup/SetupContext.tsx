
import React, { createContext, useContext, useState, useEffect } from "react";

interface SetupData {
  companyInfo: Record<string, any>;
  userRoles: Record<string, any>;
  assetCategories: Record<string, any>;
  maintenanceSchedules: Record<string, any>;
  notifications: Record<string, any>;
  integrations: Record<string, any>;
  dashboardCustomization: Record<string, any>;
}

interface SetupContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setupData: SetupData;
  updateSetupData: (section: keyof SetupData, data: any) => void;
  setupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
}

// Initialize with data from localStorage if available
const getInitialSetupData = (): SetupData => {
  try {
    const savedData = localStorage.getItem('maintenease_setup');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Error loading setup data from localStorage:", error);
  }
  
  return {
    companyInfo: {},
    userRoles: {},
    assetCategories: {},
    maintenanceSchedules: {},
    notifications: {},
    integrations: {},
    dashboardCustomization: {}
  };
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(
    localStorage.getItem('maintenease_setup_complete') === 'true'
  );
  const [setupData, setSetupData] = useState<SetupData>(getInitialSetupData());

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('maintenease_setup');
      if (savedData) {
        setSetupData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading setup data:", error);
    }
  }, []);

  // Save setup data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
  }, [setupData]);

  // Update setup completion status in localStorage
  useEffect(() => {
    localStorage.setItem('maintenease_setup_complete', setupComplete.toString());
  }, [setupComplete]);

  const updateSetupData = (section: keyof SetupData, data: any) => {
    setSetupData(prev => {
      const updatedData = {
        ...prev,
        [section]: data
      };
      
      // Save to localStorage immediately
      localStorage.setItem('maintenease_setup', JSON.stringify(updatedData));
      console.log(`Updated ${section} in setupData:`, data);
      
      return updatedData;
    });
  };

  return (
    <SetupContext.Provider value={{
      currentStep,
      setCurrentStep,
      setupData,
      updateSetupData,
      setupComplete,
      setSetupComplete
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
