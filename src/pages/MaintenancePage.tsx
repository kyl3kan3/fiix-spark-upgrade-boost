
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";

const MaintenancePage = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <PreventiveMaintenanceContent />
    </DashboardLayout>
  );
};

export default MaintenancePage;
