import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import ChecklistSubmissionForm from "@/components/checklists/ChecklistSubmissionForm";
import MultiAssetSubmissionForm from "@/components/checklists/MultiAssetSubmissionForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";

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
      state: { message: "Checklist submitted successfully!" },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Fill Out Checklist" />
        <div className="px-4 md:px-6 lg:px-8 py-6 text-sm text-muted-foreground">Loading…</div>
      </DashboardLayout>
    );
  }

  if (error || !checklist) {
    return (
      <DashboardLayout>
        <div className="px-4 md:px-6 lg:px-8 pt-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/checklists")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Checklists
          </Button>
        </div>
        <div className="px-4 md:px-6 lg:px-8 py-12 text-center">
          <h2 className="font-headline text-xl font-semibold mb-2">Checklist not found</h2>
          <p className="text-muted-foreground">The checklist you're trying to fill out doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/checklists")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Checklists
        </Button>
      </div>

      <PageHeader
        title="Fill Out Checklist"
        description={checklist.name}
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-4xl">
          {checklist.description && (
            <div className="surface-card rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{checklist.description}</p>
            </div>
          )}

          {(checklist.asset_ids?.length || 0) > 0 ? (
            <MultiAssetSubmissionForm
              checklist={checklist}
              onSubmitSuccess={handleSubmitSuccess}
            />
          ) : (
            <ChecklistSubmissionForm
              checklist={checklist}
              onSubmitSuccess={handleSubmitSuccess}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmitPage;
