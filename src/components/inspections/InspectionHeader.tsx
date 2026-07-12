import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { InspectionStatus, InspectionPriority } from "@/types/inspections";

interface InspectionHeaderProps {
  id: string;
  title: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  handleBackClick: () => void;
  handleUpdateStatus?: (status: InspectionStatus) => void;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "scheduled":
      return { label: "Scheduled", className: "bg-primary/15 text-primary border border-primary/30" };
    case "in-progress":
      return { label: "In Progress", className: "bg-warning/15 text-warning border border-warning/30" };
    case "completed":
      return { label: "Completed", className: "bg-success/15 text-success border border-success/30" };
    case "failed":
      return { label: "Failed", className: "bg-destructive/15 text-destructive border border-destructive/30" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-muted text-muted-foreground border border-border" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border border-border" };
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "low":
      return { label: "Low", className: "bg-success/15 text-success border border-success/30" };
    case "medium":
      return { label: "Medium", className: "bg-primary/15 text-primary border border-primary/30" };
    case "high":
      return { label: "High", className: "bg-warning/15 text-warning border border-warning/30" };
    case "critical":
      return { label: "Critical", className: "bg-destructive/15 text-destructive border border-destructive/30" };
    default:
      return { label: priority, className: "bg-muted text-muted-foreground border border-border" };
  }
}

const InspectionHeader: React.FC<InspectionHeaderProps> = ({
  id,
  title,
  status,
  priority,
  handleBackClick,
  handleUpdateStatus,
}) => {
  const statusConfig = getStatusConfig(status);
  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-4 pb-0">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Inspections
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-normal text-foreground">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${priorityConfig.className}`}>
              {priorityConfig.label} Priority
            </span>
          </div>
        </div>

        {handleUpdateStatus && status !== "completed" && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="border-success/40 text-success hover:bg-success/10"
              onClick={() => handleUpdateStatus("completed")}
            >
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionHeader;
