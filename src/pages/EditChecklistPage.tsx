
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ChecklistForm from "@/components/checklists/ChecklistForm";

const EditChecklistPage = () => {
  return (
    <DashboardLayout>
      <ChecklistForm mode="edit" />
    </DashboardLayout>
  );
};

export default EditChecklistPage;
