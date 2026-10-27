import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { MaintenanceCodesDashboard } from "@/components/maintenanceCodes/MaintenanceCodesDashboard";

const MaintenanceCodesPage = () => (
  <DashboardLayout>
    <PageHeader
      code="COD · 001"
      title="Failure & downtime codes"
      description="Standardize failure and downtime reasons on completed work orders for MTTR reporting."
    />
    <PageContainer>
      <PaywallGate
        feature="failure_downtime_codes"
        title="Failure & downtime codes are a Pro feature"
        description="Upgrade to tag completed jobs with failure/downtime codes and track MTTR."
      >
        <MaintenanceCodesDashboard />
      </PaywallGate>
    </PageContainer>
  </DashboardLayout>
);

export default MaintenanceCodesPage;
