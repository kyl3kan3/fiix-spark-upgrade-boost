import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkOrderPage } from "@/components/workOrders/WorkOrderPage";

const WorkOrdersPage = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <PageHeader
        code="WO · INDEX"
        title="Work Orders"
        description="Dispatch, triage, and track every job."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5" />Filters</Button>
            <Button variant="accent" size="sm" onClick={() => navigate("/work-orders/new")}>
              <Plus className="h-3.5 w-3.5" />New WO
            </Button>
          </>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <WorkOrderPage />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
