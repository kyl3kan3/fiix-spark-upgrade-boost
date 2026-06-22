import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import AssistantChat from "@/components/assistant/AssistantChat";

const AssistantPage = () => (
  <DashboardLayout>
    <PageHeader
      code="AI · 001"
      title="Assistant"
      description="Ask about your assets, work orders, costs, energy, and equipment risk — and have the assistant draft work orders for you to confirm."
    />
    <PageContainer>
      <AssistantChat />
    </PageContainer>
  </DashboardLayout>
);

export default AssistantPage;
