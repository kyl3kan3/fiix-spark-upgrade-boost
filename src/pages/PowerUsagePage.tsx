import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { usePowerUsage } from "@/hooks/usePowerUsage";
import PowerUsageDashboard from "@/components/powerUsage/PowerUsageDashboard";
import LogEnergyReadingDialog from "@/components/powerUsage/LogEnergyReadingDialog";
import ImportEnergyCsvDialog from "@/components/powerUsage/ImportEnergyCsvDialog";

const PowerUsagePage = () => {
  const { readings, summary, assets, assetNames, isLoading, error, refetch, create, importCsv } =
    usePowerUsage();

  return (
    <DashboardLayout>
      <PageHeader
        code="PWR · 001"
        title="Power Usage"
        description="Track energy consumption and cost across your equipment and meters. Log readings by hand or import a CSV now; a live utility integration can feed the same dashboard later."
        actions={
          <div className="flex flex-wrap gap-2">
            <ImportEnergyCsvDialog
              isImporting={importCsv.isPending}
              onImport={(rows, currency) => importCsv.mutateAsync([rows, currency])}
            />
            <LogEnergyReadingDialog
              assets={assets}
              isPending={create.isPending}
              onCreate={(payload) => create.mutateAsync(payload)}
            />
          </div>
        }
      />
      <PageContainer>
        <PowerUsageDashboard
          summary={summary}
          readings={readings}
          assetNames={assetNames}
          isLoading={isLoading}
          loadError={error}
          onRetry={() => refetch()}
        />
      </PageContainer>
    </DashboardLayout>
  );
};

export default PowerUsagePage;
