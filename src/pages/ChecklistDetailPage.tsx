import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Play, Calendar, ListChecks, Clock, ClipboardList } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistFrequencies } from "@/types/checklists";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { format } from "date-fns";

function getTypeConfig(type: string) {
  switch (type) {
    case "safety":
      return { label: "Safety", className: "bg-destructive/15 text-destructive border border-destructive/30" };
    case "equipment":
      return { label: "Equipment", className: "bg-primary/15 text-primary border border-primary/30" };
    case "maintenance":
      return { label: "Maintenance", className: "bg-warning/15 text-warning border border-warning/30" };
    case "quality":
      return { label: "Quality", className: "bg-success/15 text-success border border-success/30" };
    default:
      return { label: type, className: "bg-muted text-muted-foreground border border-border" };
  }
}

function getFrequencyConfig(frequency: string) {
  const found = ChecklistFrequencies.find((f) => f.value === frequency);
  return { label: found?.label ?? frequency, className: "bg-muted text-muted-foreground border border-border" };
}

const ChecklistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ["checklist", id],
    queryFn: () => checklistService.getChecklistById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="Loading checklist…" />
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
          <p className="text-muted-foreground">The checklist you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  const typeConfig = getTypeConfig(checklist.type);
  const freqConfig = getFrequencyConfig(checklist.frequency);

  return (
    <DashboardLayout>
      {/* Back */}
      <div className="px-4 md:px-6 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/checklists")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Checklists
        </Button>
      </div>

      <PageHeader
        title={checklist.name}
        description={checklist.description || "Checklist details"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/checklists/${checklist.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="accent" onClick={() => navigate(`/checklists/${checklist.id}/submit`)}>
              <Play className="h-4 w-4 mr-1" /> Fill Out
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Main col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meta card */}
            <div className="surface-card rounded-lg p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeConfig.className}`}>
                  {typeConfig.label}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${freqConfig.className}`}>
                  {freqConfig.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ListChecks className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="label-eyebrow">Items</p>
                    <p className="text-sm font-semibold text-foreground">{checklist.items?.length ?? 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="label-eyebrow">Frequency</p>
                    <p className="text-sm font-semibold text-foreground">{freqConfig.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="label-eyebrow">Created</p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(checklist.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items card */}
            <div className="surface-card rounded-lg p-6">
              <h2 className="font-headline font-semibold text-lg text-foreground mb-4">Checklist Items</h2>

              {!checklist.items || checklist.items.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                    <ListChecks className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-1">No items yet</p>
                  <p className="text-sm text-muted-foreground mb-4">This checklist doesn't have any items yet.</p>
                  <Button variant="outline" onClick={() => navigate(`/checklists/${checklist.id}/edit`)}>
                    Add Items
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklist.items
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/40 border border-border rounded-lg">
                        <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{item.title}</span>
                            {item.is_required && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-warning/15 text-warning border border-warning/30">
                                Required
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-muted text-muted-foreground border border-border capitalize">
                              {item.item_type}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <div className="surface-card rounded-lg p-6">
              <h3 className="label-eyebrow mb-5">Summary</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <p className="font-headline font-semibold text-base text-foreground mb-2">{checklist.name}</p>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeConfig.className}`}>
                  {typeConfig.label}
                </span>
              </div>
            </div>

            <div className="surface-card rounded-lg p-6">
              <h3 className="label-eyebrow mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="accent" className="w-full justify-start gap-2" onClick={() => navigate(`/checklists/${checklist.id}/submit`)}>
                  <Play className="h-4 w-4" /> Fill Out Checklist
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(`/checklists/${checklist.id}/edit`)}>
                  <Edit className="h-4 w-4 text-secondary" /> Edit Checklist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistDetailPage;
