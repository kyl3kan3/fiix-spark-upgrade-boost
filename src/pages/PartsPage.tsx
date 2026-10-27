import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { PartsDashboard } from "@/components/parts/PartsDashboard";

const PartsPage = () => (
  <DashboardLayout>
    <PageHeader
      code="PART · 001"
      title="Parts"
      description="Spare-parts catalog, shelf stock with minimum quantities, low-stock alerts, and consumption logged when jobs are completed."
    />
    <PageContainer>
      <PaywallGate
        feature="parts_inventory"
        title="Parts inventory is a Pro feature"
        description="Upgrade to Pro or Business to manage parts catalogs, on-hand inventory, reorder alerts, and work-order consumption."
      >
        <PartsDashboard />
      </PaywallGate>
    </PageContainer>
  </DashboardLayout>
);

export default PartsPage;
