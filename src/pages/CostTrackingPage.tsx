import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { useCostTracking } from "@/hooks/useCostTracking";
import CostTrackingDashboard from "@/components/costTracking/CostTrackingDashboard";
import LogCostDialog from "@/components/costTracking/LogCostDialog";
import { fetchCostableAssets } from "@/services/costTrackingService";
import { useQuery } from "@tanstack/react-query";

const CostTrackingPage = () => {
  const { costs, summary, assetNames, isLoading, error, refetch, create } = useCostTracking();

  const { data: assets = [] } = useQuery({
    queryKey: ["cost-tracking", "assets"],
    queryFn: fetchCostableAssets,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DashboardLayout>
      <PageHeader
        code="COST · 001"
        title="Cost & Savings"
        description="Track maintenance spend across labor, parts, contractors and downtime — and see how much of it is preventive versus reactive."
        actions={
          <LogCostDialog
            assets={assets}
            isPending={create.isPending}
            onCreate={(payload) => create.mutateAsync(payload)}
          />
        }
      />
      <PageContainer>
        <CostTrackingDashboard
          summary={summary}
          costs={costs}
          assetNames={assetNames}
          isLoading={isLoading}
          loadError={error}
          onRetry={() => refetch()}
        />
      </PageContainer>
    </DashboardLayout>
  );
};

export default CostTrackingPage;
