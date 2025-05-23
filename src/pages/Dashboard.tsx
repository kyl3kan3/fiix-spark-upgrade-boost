
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardWelcomeCard from "@/components/dashboard/overview/DashboardWelcomeCard";
import DashboardMetricCards from "@/components/dashboard/overview/DashboardMetricCards";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardActivityCard from "@/components/dashboard/overview/DashboardActivityCard";
import DashboardAtAGlance from "@/components/dashboard/overview/DashboardAtAGlance";
import DashboardLoadingState from "@/components/dashboard/overview/DashboardLoadingState";
import DashboardErrorState from "@/components/dashboard/overview/DashboardErrorState";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";

const Dashboard: React.FC = () => {
  const { userName, companyName, role, isLoading, loadingError } = useDashboardData();

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (loadingError) {
    return <DashboardErrorState errorMessage={loadingError} />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <DashboardWelcomeCard 
          userName={userName} 
          companyName={companyName} 
          role={role} 
        />
        
        <DashboardMetricCards />
        
        <div className="mb-8">
          <DashboardQuickActions />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardActivityCard />
          <DashboardAtAGlance />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
