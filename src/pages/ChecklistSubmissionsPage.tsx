import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistTypes } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { format } from "date-fns";

function getTypeConfig(type: string) {
  switch (type) {
    case "safety":
      return "bg-destructive/15 text-destructive border border-destructive/30";
    case "equipment":
      return "bg-primary/15 text-primary border border-primary/30";
    case "maintenance":
      return "bg-warning/15 text-warning border border-warning/30";
    case "quality":
      return "bg-success/15 text-success border border-success/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return { label: "Completed", className: "bg-success/15 text-success border border-success/30" };
    case "in-progress":
      return { label: "In Progress", className: "bg-warning/15 text-warning border border-warning/30" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border border-border" };
  }
}

const ChecklistSubmissionsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["checklist-submissions"],
    queryFn: checklistService.getSubmissions,
  });

  const filteredSubmissions = submissions.filter((submission) => {
    return (
      submission.checklist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Checklist Submissions" />
        <div className="px-4 md:px-6 lg:px-8 py-6 text-sm text-muted-foreground">Loading…</div>
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
        title="Checklist Submissions"
        description="View completed checklist submissions and their details"
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search submissions…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Empty state */}
        {filteredSubmissions.length === 0 ? (
          <div className="surface-card rounded-lg p-12 text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">
              {submissions.length === 0 ? "No submissions yet" : "No matching submissions"}
            </p>
            <p className="text-sm text-muted-foreground">
              {submissions.length === 0
                ? "Submit some checklists to see them here"
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const statusConfig = getStatusConfig(submission.status);
              return (
                <div key={submission.id} className="surface-card rounded-lg p-6">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-headline font-semibold text-foreground">
                          {submission.checklist?.name}
                        </h3>
                        {submission.checklist?.type && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getTypeConfig(submission.checklist.type)}`}>
                            {ChecklistTypes.find((t) => t.value === submission.checklist?.type)?.label ?? submission.checklist.type}
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      {submission.notes && (
                        <p className="text-sm text-muted-foreground mb-3">{submission.notes}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-secondary" />
                          <span>{format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                          <span>{submission.items?.length ?? 0} items completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responses */}
                  {submission.items && submission.items.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="label-eyebrow mb-3">Responses</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {submission.items.slice(0, 6).map((item) => (
                          <div key={item.id} className="bg-muted/50 border border-border rounded-lg p-3">
                            <p className="text-xs font-semibold text-foreground mb-1">
                              {item.checklist_item?.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.checklist_item?.item_type === "checkbox"
                                ? item.is_checked
                                  ? "Completed"
                                  : "Not completed"
                                : item.response_value || "No response"}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{item.notes}"</p>
                            )}
                          </div>
                        ))}
                        {submission.items.length > 6 && (
                          <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{submission.items.length - 6} more items</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistSubmissionsPage;
