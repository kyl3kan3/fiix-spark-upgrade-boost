
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SetupProvider } from "@/components/setup/SetupContext";
import { SetupContainer } from "@/components/setup/SetupContainer";

const SetupPage = () => {
  return (
    <DashboardLayout>
      <SetupProvider>
        <SetupContainer />
      </SetupProvider>
    </DashboardLayout>
  );
};

export default SetupPage;
