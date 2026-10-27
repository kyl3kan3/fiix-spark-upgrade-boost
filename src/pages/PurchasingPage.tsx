import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { PurchasingDashboard } from "@/components/purchasing/PurchasingDashboard";

const PurchasingPage = () => (
  <DashboardLayout>
    <PageHeader
      code="PO · 001"
      title="Purchasing"
      description="Purchase requests, vendor POs with tax, and receiving lines into parts inventory."
    />
    <PageContainer>
      <PaywallGate
        feature="purchasing"
        title="Purchasing is a Pro feature"
        description="Upgrade to Pro or Business to manage purchase requests, PO totals with tax, and stock receipts."
      >
        <PurchasingDashboard />
      </PaywallGate>
    </PageContainer>
  </DashboardLayout>
);

export default PurchasingPage;
