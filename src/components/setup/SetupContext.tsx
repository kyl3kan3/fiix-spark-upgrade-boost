
import React, { createContext, useContext, useState } from "react";

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

const initialSetupData: SetupData = {
  companyInfo: {},
  userRoles: {},
  assetCategories: {},
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

  const updateSetupData = (section: keyof SetupData, data: any) => {
    setSetupData(prev => ({
      ...prev,
      [section]: data
    }));
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
