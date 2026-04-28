import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkOrderPage } from "@/components/workOrders/WorkOrderPage";

const WorkOrdersPage = () => {
  const navigate = useNavigate();
  const goNew = () => navigate("/work-orders/new");
  return (
    <DashboardLayout>
      <PageHeader
        title="My Jobs"
        description="Everything you need to fix, check, or follow up on."
        actions={
          <Button variant="accent" size="default" onClick={goNew} className="hidden sm:inline-flex">
            <Plus className="h-5 w-5" />New job
          </Button>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-4">
        {/* Mobile-first prominent CTA */}
        <Button
          variant="accent"
          size="lg"
          onClick={goNew}
          className="w-full sm:hidden"
        >
          <Plus className="h-5 w-5" />New job
        </Button>
        <WorkOrderPage />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
