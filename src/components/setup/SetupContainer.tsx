
import React from "react";
import { useSetup } from "./SetupContext";
import { SetupLoader } from "./SetupLoader";
import { SetupContent } from "./SetupContent";

const SetupContainer: React.FC = () => {
  const { 
    isAuthenticated, 
    isAuthLoading, 
    isDataLoading
  } = useSetup();

  // Show loading while checking auth or loading data
  if (isAuthLoading || isDataLoading) {
    return <SetupLoader />;
  }

  // Redirect to auth will be handled by useSetupAuth hook
  if (!isAuthenticated) {
    return null;
  }

  return <SetupContent />;
};

export default SetupContainer;
