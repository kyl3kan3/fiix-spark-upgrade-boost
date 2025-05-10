
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetForm from "@/components/workOrders/assets/AssetForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AssetFormPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!assetId;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Button 
          onClick={() => navigate(-1)} 
          className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
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
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <AssetForm assetId={assetId} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssetFormPage;
