import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { usePredictiveMaintenance } from "@/hooks/usePredictiveMaintenance";
import PredictiveMaintenanceDashboard from "@/components/predictiveMaintenance/PredictiveMaintenanceDashboard";

const PredictiveMaintenancePage = () => {
  const { scores, stats, isLoading, recompute, isRecomputing } = usePredictiveMaintenance();

  const lastComputed = stats.lastComputedAt
    ? new Date(stats.lastComputedAt).toLocaleString()
    : null;

  return (
    <DashboardLayout>
      <PageHeader
        code="PDM · 001"
        title="Predictive Maintenance"
        description="AI-powered risk scoring that predicts which equipment is most likely to fail, so you can act before it breaks down."
        actions={
          <Button onClick={recompute} disabled={isRecomputing}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isRecomputing ? "Analyzing…" : "Recompute risk"}
          </Button>
        }
        meta={
          lastComputed ? (
            <p className="text-xs text-muted-foreground">Last analyzed {lastComputed}</p>
          ) : undefined
        }
      />
      <PageContainer>
        <PredictiveMaintenanceDashboard
          scores={scores}
          stats={stats}
          isLoading={isLoading}
          onRecompute={recompute}
          isRecomputing={isRecomputing}
        />
      </PageContainer>
    </DashboardLayout>
  );
};

export default PredictiveMaintenancePage;
