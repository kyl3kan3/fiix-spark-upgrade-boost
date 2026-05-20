
export const statusColorMap: Record<string, string> = {
 pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
 in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
 completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
 cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const priorityColorMap: Record<string, string> = {
 low: "bg-muted text-foreground dark:bg-card dark:text-muted-foreground",
 medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
 high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
 urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const getStatusColor = (status: string) => {
 return statusColorMap[status] || "bg-muted text-foreground dark:bg-card dark:text-muted-foreground";
};

export const getPriorityColor = (priority: string) => {
 return priorityColorMap[priority] || "bg-muted text-foreground dark:bg-card dark:text-muted-foreground";
};

export const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric"
 }).format(date);
};
