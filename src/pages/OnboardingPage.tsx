
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

const OnboardingPage = () => (
  <DashboardLayout>
    <div className="container mx-auto max-w-lg pt-12 pb-20">
      <h1 className="text-3xl font-bold mb-3">Welcome! Let’s get you started</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8">
        <OnboardingForm />
      </div>
    </div>
  </DashboardLayout>
);

export default OnboardingPage;
