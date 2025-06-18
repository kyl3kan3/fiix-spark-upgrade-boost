
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChecklistForm from "@/components/checklists/ChecklistForm";

const NewChecklistPage = () => {
  return (
    <DashboardLayout>
      <ChecklistForm mode="create" />
    </DashboardLayout>
  );
};

export default NewChecklistPage;
