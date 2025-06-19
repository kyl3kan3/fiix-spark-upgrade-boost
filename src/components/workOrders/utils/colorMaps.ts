
// This file is deprecated - color utilities have been moved to workOrderUtils.ts
// Please import getStatusColor and getPriorityColor from ../workOrderUtils instead

export const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export const priorityColorMap: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};
