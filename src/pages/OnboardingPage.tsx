
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OnboardingForm from "@/features/onboarding/components/OnboardingForm";

const OnboardingPage = () => (
  <DashboardLayout>
    <div className="container mx-auto max-w-2xl pt-12 pb-20">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-primary mb-2">
          Welcome to MaintenEase
        </h1>
        <p className="text-muted-foreground">
          Your workspace is ready. Let's take a quick moment to configure your environment
          for peak operational efficiency.
        </p>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <OnboardingForm />
      </div>
    </div>
  </DashboardLayout>
);

export default OnboardingPage;
