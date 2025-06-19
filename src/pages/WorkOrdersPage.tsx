
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { WorkOrderPage } from "@/components/workOrders/WorkOrderPage";

const WorkOrdersPage = () => {
  return (
    <DashboardLayout>
      <WorkOrderPage />
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
