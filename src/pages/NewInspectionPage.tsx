
import React from "react";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NewInspectionForm from "@/components/inspections/NewInspectionForm";
import PageHeader from "@/components/shell/PageHeader";

const NewInspectionPage = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>New Check-Up | MaintenEase</title>
      </Helmet>
      <PageHeader
        title="Start a Check-Up"
        description="Pick what you're checking and who's doing it — we'll save it to your list."
      />
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <NewInspectionForm />
      </div>
    </DashboardLayout>
  );
};

export default NewInspectionPage;
