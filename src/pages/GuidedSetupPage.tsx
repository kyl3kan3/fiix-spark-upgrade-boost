import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuidedSetup } from "@/hooks/useGuidedSetup";
import SetupWizard from "@/features/onboarding/components/SetupWizard";
import PersonalizedPlan from "@/features/onboarding/components/PersonalizedPlan";

const GuidedSetupPage = () => {
  const { profile, isLoading, save } = useGuidedSetup();
  const [editing, setEditing] = useState(false);

  const showPlan = profile && profile.plan?.modules?.length && !editing;

  return (
    <DashboardLayout>
      <PageHeader
        code="SETUP · 001"
        title="Guided Setup"
        description="Answer a few quick questions and get a starter plan tailored to your goals — which tools to use first, and a checklist to get rolling."
      />
      <PageContainer>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : showPlan ? (
          <PersonalizedPlan plan={profile!.plan} onRedo={() => setEditing(true)} />
        ) : (
          <SetupWizard
            initial={profile ? { goals: profile.goals, industry: profile.industry, teamSize: profile.teamSize } : undefined}
            isSaving={save.isPending}
            onSubmit={(answers) => save.mutate(answers, { onSuccess: () => setEditing(false) })}
          />
        )}
      </PageContainer>
    </DashboardLayout>
  );
};

export default GuidedSetupPage;
