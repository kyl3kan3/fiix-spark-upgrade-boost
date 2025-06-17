
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import PreventiveMaintenanceContent from "@/components/features/PreventiveMaintenanceContent";

const MaintenancePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        <PreventiveMaintenanceContent />
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePage;
