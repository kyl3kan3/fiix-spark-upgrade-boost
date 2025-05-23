
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
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard: React.FC = () => {
  console.log("Dashboard.tsx: Rendering Dashboard component - should NOT contain any Router");
  
  const { userName, companyName, role, isLoading, loadingError } = useDashboardData();
  const isMobile = useIsMobile();

  console.log("Dashboard render state:", { isLoading, loadingError, userName });

  // Show loading state
  if (isLoading) {
    console.log("Dashboard.tsx: Rendering loading state");
    return <DashboardLoadingState />;
  }

  // Show error state if there's an error
  if (loadingError) {
    console.log("Dashboard.tsx: Rendering error state");
    return <DashboardErrorState errorMessage={loadingError} />;
  }

  console.log("Dashboard.tsx: Rendering main dashboard content");

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 max-w-full">
        <DashboardWelcomeCard 
          userName={userName} 
          companyName={companyName} 
          role={role} 
        />
        
        <DashboardMetricCards />
        
        <div className="mb-6">
          <DashboardQuickActions />
        </div>
        
        {/* Adjust grid layout based on mobile vs desktop */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div>
            <DashboardActivityCard />
          </div>
          {!isMobile && (
            <div>
              <DashboardAtAGlance />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
