import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { Button } from "@/components/ui/button";
import { HeartPulse, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelfHealing } from "@/hooks/useSelfHealing";
import HealerToggles from "@/components/selfHealing/HealerToggles";
import RunsTable from "@/components/selfHealing/RunsTable";

export default function SelfHealingPage() {
  const {
    runs,
    isLoadingRuns,
    settings,
    pendingFlagCount,
    triggerRun,
    isTriggering,
    saveSettings,
  } = useSelfHealing();

  return (
    <DashboardLayout>
      <PageHeader
        title="Self-Healing"
        description="Automated routines that detect and repair issues across your tenant — risk-scoring retries, stuck work orders, data integrity, and AI triage of new requests."
        actions={
          <Button onClick={() => triggerRun()} disabled={isTriggering}>
            {isTriggering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running…
              </>
            ) : (
              <>
                <HeartPulse className="h-4 w-4 mr-2" /> Run all healers now
              </>
            )}
          </Button>
        }
        meta={
          pendingFlagCount > 0 ? (
            <Badge variant="destructive">
              {pendingFlagCount} issue{pendingFlagCount === 1 ? "" : "s"} need your review
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground">
              Scheduled to run every 30 minutes. Triggered automatically on new public requests.
            </p>
          )
        }
      />
      <PageContainer>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <HealerToggles
              settings={settings}
              onChange={(updates) => saveSettings(updates)}
            />
          </div>
          <div className="md:col-span-2">
            <RunsTable runs={runs} isLoading={isLoadingRuns} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}