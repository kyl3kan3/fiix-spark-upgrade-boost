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
        title="My Jobs"
        description="Everything you need to fix, check, or follow up on."
        actions={
          <>
            <Button variant="outline" size="lg"><Filter className="h-4 w-4" />Filter</Button>
            <Button variant="accent" size="lg" onClick={() => navigate("/work-orders/new")}>
              <Plus className="h-5 w-5" />New Job
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
