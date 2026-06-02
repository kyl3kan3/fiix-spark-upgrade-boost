import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import PageHeader from "@/components/shell/PageHeader";
import ReportsContent from "@/components/features/ReportsContent";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const ReportsPage = () => {
 return (
 <DashboardLayout>
 <Helmet>
 <title>Reports | MaintenEase</title>
 <meta name="description" content="Maintenance reports and analytics: work order completion, asset health, inspection trends, and team performance summaries for your facility." />
 <link rel="canonical" href="https://maintenease.com/reports" />
 </Helmet>
 <PageHeader
 title="Analytics & Reports"
 description="Simple summaries of your work — what's done, what's pending, and how things are trending."
 actions={
 <Button className="bg-primary hover:bg-primary-variant text-primary-foreground shadow-sm" size="lg">
 <Download className="h-4 w-4 mr-2" />
 Generate Report
 </Button>
 }
 />
 <PageContainer>
 <ReportsContent />
 </PageContainer>
 </DashboardLayout>
 );
};

export default ReportsPage;
