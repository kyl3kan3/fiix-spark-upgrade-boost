import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import ReportsContent from "@/components/features/ReportsContent";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <Helmet><title>Reports | MaintenEase</title></Helmet>
      <PageHeader
        title="Reports"
        description="Simple summaries of your work — what's done, what's pending, and how things are trending."
        actions={
          <Button variant="accent" size="lg"><Download className="h-4 w-4" />Download</Button>
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <ReportsContent />
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
