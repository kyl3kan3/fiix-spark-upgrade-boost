
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
      const parsedData = JSON.parse(savedData);
      
      // Fix any lowercase key issue - ensure we use camelCase keys
      if (parsedData.companyinfo && !parsedData.companyInfo) {
        parsedData.companyInfo = parsedData.companyinfo;
        delete parsedData.companyinfo;
      }
      
      return parsedData;
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
        const parsedData = JSON.parse(savedData);
        
        // Fix any lowercase key issue
        if (parsedData.companyinfo && !parsedData.companyInfo) {
          parsedData.companyInfo = parsedData.companyinfo;
          delete parsedData.companyinfo;
        }
        
        setSetupData(parsedData);
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
      // Ensure we're using the correct camelCase key
      const normalizedSection = section.charAt(0).toLowerCase() + section.slice(1);
      
      const updatedData = {
        ...prev,
        [normalizedSection]: data
      };
      
      // Save to localStorage immediately
      localStorage.setItem('maintenease_setup', JSON.stringify(updatedData));
      console.log(`Updated ${normalizedSection} in setupData:`, data);
      
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
