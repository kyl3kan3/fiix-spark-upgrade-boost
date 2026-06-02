
export const statusColorMap: Record<string, string> = {
 pending: "bg-warning/10 text-warning border border-warning/30",
 in_progress: "bg-primary/10 text-primary border border-primary/30",
 completed: "bg-success/10 text-success border border-success/30",
 cancelled: "bg-muted text-muted-foreground border border-border",
};

export const priorityColorMap: Record<string, string> = {
 low: "bg-muted text-muted-foreground border border-border",
 medium: "bg-warning/10 text-warning border border-warning/30",
 high: "bg-destructive/10 text-destructive border border-destructive/30",
 urgent: "bg-destructive/15 text-destructive border border-destructive/40",
};

export const getStatusColor = (status: string) => {
 return statusColorMap[status] || "bg-muted text-foreground  ";
};

export const getPriorityColor = (priority: string) => {
 return priorityColorMap[priority] || "bg-muted text-foreground  ";
};

export const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric"
 }).format(date);
};
