import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { MttrReportPanel } from "@/components/maintenanceCodes/MttrReportPanel";

const MttrReportPage = () => (
  <DashboardLayout>
    <PageHeader
      code="RPT · MTTR"
      title="MTTR by failure code"
      description="Average repair downtime for completed work orders grouped by failure reason."
    />
    <PageContainer>
      <PaywallGate feature="failure_downtime_codes" title="MTTR reporting is a Pro feature">
        <MttrReportPanel />
      </PaywallGate>
    </PageContainer>
  </DashboardLayout>
);

export default MttrReportPage;
