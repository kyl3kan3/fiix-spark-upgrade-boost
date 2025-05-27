
import React from "react";
import { useParams } from "react-router-dom";
import { AssetForm } from "@/components/workOrders/assets/AssetForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const AssetFormPage = () => {
  const { assetId } = useParams();
  const isEditing = !!assetId;
  
  console.log("AssetFormPage rendering, assetId:", assetId, "isEditing:", isEditing);

  return (
    <DashboardLayout>
      <BackToDashboard />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Edit Asset" : "Add New Asset"}
        </h1>
        <p className="text-xl text-gray-600">
          {isEditing 
            ? "Update the details of your existing asset" 
            : "Add a new asset to your inventory"}
        </p>
      </div>
      
      <AssetForm assetId={assetId} />
    </DashboardLayout>
  );
};

export default AssetFormPage;
