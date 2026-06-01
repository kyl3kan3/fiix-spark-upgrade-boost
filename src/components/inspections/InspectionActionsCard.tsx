import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Check, X } from "lucide-react";
import { InspectionStatus } from "@/types/inspections";

interface InspectionActionsCardProps {
  status: InspectionStatus;
  handleUpdateStatus: (status: InspectionStatus) => void;
}

const InspectionActionsCard: React.FC<InspectionActionsCardProps> = ({
  status,
  handleUpdateStatus,
}) => {
  return (
    <div className="surface-card rounded-lg p-6">
      <h3 className="font-headline font-semibold text-base text-foreground mb-4">Update Status</h3>
      <div className="space-y-2">
        <Button
          className="w-full justify-start gap-2"
          variant={status === "scheduled" ? "default" : "outline"}
          onClick={() => handleUpdateStatus("scheduled")}
        >
          <Clock className="h-4 w-4" />
          Set as Scheduled
        </Button>

        <Button
          className="w-full justify-start gap-2"
          variant={status === "in-progress" ? "default" : "outline"}
          onClick={() => handleUpdateStatus("in-progress")}
        >
          <Clock className="h-4 w-4" />
          Set as In Progress
        </Button>

        <Button
          className={`w-full justify-start gap-2 ${status !== "completed" ? "border-success/40 text-success hover:bg-success/10" : ""}`}
          variant={status === "completed" ? "default" : "outline"}
          onClick={() => handleUpdateStatus("completed")}
        >
          <Check className="h-4 w-4" />
          Complete Inspection
        </Button>

        <Button
          className={`w-full justify-start gap-2 ${status !== "failed" ? "border-destructive/40 text-destructive hover:bg-destructive/10" : ""}`}
          variant={status === "failed" ? "default" : "outline"}
          onClick={() => handleUpdateStatus("failed")}
        >
          <X className="h-4 w-4" />
          Mark as Failed
        </Button>

        <Button
          className="w-full justify-start gap-2"
          variant={status === "cancelled" ? "default" : "outline"}
          onClick={() => handleUpdateStatus("cancelled")}
        >
          <X className="h-4 w-4" />
          Cancel Inspection
        </Button>
      </div>
    </div>
  );
};

export default InspectionActionsCard;
