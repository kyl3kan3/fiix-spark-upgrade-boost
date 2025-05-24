
import React, { createContext, useContext, ReactNode } from "react";
import { useSetupAuth } from "@/hooks/setup/useSetupAuth";
import { useSetupData } from "@/hooks/setup/useSetupData";
import { useSetupNavigation } from "@/hooks/setup/useSetupNavigation";
import { useSetupCompletion } from "@/hooks/setup/useSetupCompletion";

interface SetupContextType {
  // Auth
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Data
  setupData: any;
  updateSetupData: (updates: any) => void;
  isDataLoading: boolean;
  refreshData: () => void;
  
  // Navigation
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setCurrentStep: (step: number) => void;
  
  // Completion
  isCompleting: boolean;
  completeSetup: () => Promise<void>;
  setupComplete: boolean;
  setSetupComplete: (complete: boolean) => void;
  
  // Loading state
  isLoading: boolean;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const auth = useSetupAuth();
  const data = useSetupData();
  const navigation = useSetupNavigation();
  const completion = useSetupCompletion();

  const value: SetupContextType = {
    // Auth
    isAuthenticated: auth.isAuthenticated,
    isAuthLoading: auth.isAuthLoading,
    
    // Data
    setupData: data.setupData,
    updateSetupData: data.updateSetupData,
    isDataLoading: data.isLoading,
    refreshData: data.refreshData,
    
    // Navigation
    currentStep: navigation.currentStep,
    nextStep: navigation.nextStep,
    prevStep: navigation.prevStep,
    goToStep: navigation.goToStep,
    setCurrentStep: navigation.setCurrentStep,
    
    // Completion
    isCompleting: completion.isCompleting,
    completeSetup: completion.completeSetup,
    setupComplete: false, // Default value - should be managed by completion hook
    setSetupComplete: () => {}, // Default no-op - should be managed by completion hook
    
    // Loading state
    isLoading: auth.isAuthLoading || data.isLoading
  };

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
}
