
import React from "react";
import { useParams } from "react-router-dom";
import { AssetForm } from "@/components/workOrders/assets/AssetForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";

const AssetFormPage = () => {
  const { assetId } = useParams();
  const isEditing = !!assetId;

  return (
    <DashboardLayout>
      <PageHeader
        title={isEditing ? "Edit equipment" : "Add equipment"}
        description={
          isEditing
            ? "Update the details for this tool, machine, or fixture."
            : "Tell us about a tool, machine, or fixture you take care of."
        }
      />
      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-3xl">
        <AssetForm assetId={assetId} />
      </div>
    </DashboardLayout>
  );
};

export default AssetFormPage;
