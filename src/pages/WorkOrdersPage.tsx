
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { WorkOrderPage } from "@/components/workOrders/WorkOrderPage";

const WorkOrdersPage = () => {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <WorkOrderPage />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
