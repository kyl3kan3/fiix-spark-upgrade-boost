
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const ChecklistSubmitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/checklists")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checklists
        </Button>
        
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Submit Checklist</h1>
          <p className="text-gray-500">Checklist submission form will be implemented here.</p>
          <p className="text-sm text-gray-400 mt-2">Checklist ID: {id}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmitPage;
