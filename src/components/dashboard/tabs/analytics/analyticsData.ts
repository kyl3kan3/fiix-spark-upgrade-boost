
// Empty data placeholders
export const emptyWorkOrdersData = [
  { month: "Jan", completed: 0, pending: 0, canceled: 0 },
  { month: "Feb", completed: 0, pending: 0, canceled: 0 },
  { month: "Mar", completed: 0, pending: 0, canceled: 0 },
  { month: "Apr", completed: 0, pending: 0, canceled: 0 },
  { month: "May", completed: 0, pending: 0, canceled: 0 },
  { month: "Jun", completed: 0, pending: 0, canceled: 0 },
];

export const emptyMaintenanceCostsData = [
  { month: "Jan", planned: 0, unplanned: 0 },
  { month: "Feb", planned: 0, unplanned: 0 },
  { month: "Mar", planned: 0, unplanned: 0 },
  { month: "Apr", planned: 0, unplanned: 0 },
  { month: "May", planned: 0, unplanned: 0 },
  { month: "Jun", planned: 0, unplanned: 0 },
];

export const emptyAssetStatusData = [
  { name: "Operational", value: 0, color: "#10B981" },
  { name: "Under Maintenance", value: 0, color: "#F59E0B" },
  { name: "Out of Service", value: 0, color: "#EF4444" },
];

export const workCompletionRateConfig = {
  completed: {
    label: "Completed",
    theme: { light: "#10B981", dark: "#10B981" }
  },
};
