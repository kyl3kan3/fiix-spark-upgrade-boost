import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import ReportsContent from "@/components/features/ReportsContent";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <Helmet><title>Reports & Analytics | MaintenEase</title></Helmet>
      <PageHeader
        code="RPT · 001"
        title="Reports & Analytics"
        description="Throughput, downtime, and crew utilization across the organization."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5" />Filters</Button>
            <Button variant="accent" size="sm"><Download className="h-3.5 w-3.5" />Export</Button>
          </>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ReportsContent />
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
