
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import ChecklistSubmissionForm from "@/components/checklists/ChecklistSubmissionForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const ChecklistSubmitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: !!id,
  });

  const handleSubmitSuccess = () => {
    navigate("/checklists", {
      state: { message: "Checklist submitted successfully!" }
    });
  };

  if (isLoading) {
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
          <div className="text-center py-12">Loading checklist...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !checklist) {
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
            <h2 className="text-xl font-semibold mb-2">Checklist not found</h2>
            <p className="text-gray-500">The checklist you're trying to fill out doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Fill Out Checklist</h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-400">{checklist.name}</h2>
            {checklist.description && (
              <p className="text-gray-500 mt-2">{checklist.description}</p>
            )}
          </div>

          <ChecklistSubmissionForm 
            checklist={checklist} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmitPage;
