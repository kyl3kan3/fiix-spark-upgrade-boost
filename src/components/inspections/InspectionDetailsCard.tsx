import React from "react";
import { Package, User, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface InspectionDetailsCardProps {
  description: string;
  assetName: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
}

const InspectionDetailsCard: React.FC<InspectionDetailsCardProps> = ({
  description,
  assetName,
  assignedTo,
  scheduledDate,
  completedDate,
}) => {
  return (
    <div className="surface-card rounded-lg p-6 md:col-span-2 space-y-6">
      <h3 className="font-headline font-semibold text-lg text-foreground">Inspection Details</h3>

      {/* Description */}
      {description && (
        <div>
          <p className="label-eyebrow mb-1">Description</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      )}

      {/* Grid of detail chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="label-eyebrow">Asset</p>
            <p className="text-sm font-semibold text-foreground truncate">{assetName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="label-eyebrow">Assigned To</p>
            <p className="text-sm font-semibold text-foreground truncate">{assignedTo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="label-eyebrow">Scheduled Date</p>
            <p className="text-sm font-semibold text-foreground">
              {format(new Date(scheduledDate), "PPpp")}
            </p>
          </div>
        </div>

        {completedDate && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="label-eyebrow">Completed Date</p>
              <p className="text-sm font-semibold text-foreground">
                {format(new Date(completedDate), "PPpp")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetailsCard;
