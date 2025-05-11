
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Helmet } from "react-helmet";
import WorkOrderList from "@/components/workOrders/WorkOrderList";

const WorkOrdersPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Work Orders | MaintenEase</title>
      </Helmet>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <WorkOrderList />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
