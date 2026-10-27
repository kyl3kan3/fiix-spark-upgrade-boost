import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { LubricantsDashboard } from "@/components/lubricants/LubricantsDashboard";

const LubricantsPage = () => (
  <DashboardLayout>
    <PageHeader
      code="LUB · 001"
      title="Lubricants"
      description="Catalog shared oils and greases, track shelf inventory, and log consumption from lubrication PMs — not just the PM schedule."
    />
    <PageContainer>
      <PaywallGate
        feature="lubricant_tracking"
        title="Lubricant tracking is a Pro feature"
        description="Upgrade to Pro or Business to manage lubricant catalogs, on-hand inventory, reorder alerts, and PM consumption logs."
      >
        <LubricantsDashboard />
      </PaywallGate>
    </PageContainer>
  </DashboardLayout>
);

export default LubricantsPage;
