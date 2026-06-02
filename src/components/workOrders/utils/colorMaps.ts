
// This file is deprecated - color utilities have been moved to workOrderUtils.ts
// Please import getStatusColor and getPriorityColor from ../workOrderUtils instead

export const statusColorMap: Record<string, string> = {
 pending: "bg-warning/10 text-warning",
 in_progress: "bg-primary/10 text-primary",
 completed: "bg-success/10 text-success",
 cancelled: "bg-muted text-foreground",
};

export const priorityColorMap: Record<string, string> = {
 low: "bg-primary/10 text-primary",
 medium: "bg-muted text-foreground",
 high: "bg-warning/10 text-warning",
 urgent: "bg-destructive/10 text-destructive",
};
