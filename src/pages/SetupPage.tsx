
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import SetupAuthChecker from "@/components/setup/page/SetupAuthChecker";
import SetupPageContent from "@/components/setup/page/SetupPageContent";
import { useSetupPageState } from "@/hooks/setup/useSetupPageState";

const SetupPage = () => {
  const {
    showWelcomeBack,
    isLoading,
    isResetting,
    forceSetupMode,
    isAuthenticated,
    handleResetSetup
  } = useSetupPageState();
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <SetupAuthChecker />
        </div>
      </DashboardLayout>
    );
  }
  
  // If not authenticated, we'll redirect in the useEffect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      <SetupPageContent
        showWelcomeBack={showWelcomeBack}
        isLoading={isLoading}
        forceSetupMode={forceSetupMode}
        isResetting={isResetting}
        onResetSetup={handleResetSetup}
      />
    </DashboardLayout>
  );
};

export default SetupPage;
