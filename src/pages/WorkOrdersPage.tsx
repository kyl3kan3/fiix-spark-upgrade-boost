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
 title="Work Order Management"
 description="Oversee asset health and maintenance workflows with precision."
 actions={
 <Button variant="default" size="default" onClick={goNew} className="hidden sm:inline-flex gap-2 uppercase tracking-wide font-semibold">
 <Plus className="h-4 w-4" />Report a Problem
 </Button>
 }
 />
 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
 {/* Mobile CTA */}
 <Button
 variant="default"
 size="lg"
 onClick={goNew}
 className="w-full sm:hidden gap-2 uppercase tracking-wide font-semibold"
 >
 <Plus className="h-5 w-5" />Report a Problem
 </Button>
 <WorkOrderPage />
 </div>
 </DashboardLayout>
 );
};

export default WorkOrdersPage;
