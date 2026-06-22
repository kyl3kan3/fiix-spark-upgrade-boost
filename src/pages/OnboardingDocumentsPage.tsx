import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import DocumentDumpUploader from "@/features/onboarding/components/DocumentDumpUploader";

const OnboardingDocumentsPage = () => (
  <DashboardLayout>
    <PageHeader
      code="DOC · 001"
      title="Onboarding Documents"
      description="Drop in the documents you already have — asset lists, equipment manuals, warranties, floor plans — so your team can get set up fast. We'll keep them organized and ready to turn into records."
    />
    <PageContainer>
      <DocumentDumpUploader />
    </PageContainer>
  </DashboardLayout>
);

export default OnboardingDocumentsPage;
