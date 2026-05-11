
// Data will be populated from database
export const emptyWorkOrdersData: { month: string; completed: number; pending: number; canceled: number }[] = [];

export const emptyMaintenanceCostsData: { month: string; planned: number; unplanned: number }[] = [];

export const emptyAssetStatusData: { name: string; value: number; color: string }[] = [];

export const workCompletionRateConfig = {
  completed: {
    label: "Completed",
    theme: { light: "#10B981", dark: "#10B981" }
  },
};
