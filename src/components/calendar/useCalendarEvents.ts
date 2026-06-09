import { useQuery } from "@tanstack/react-query";
import { getScheduledWorkOrders } from "@/services/workOrderService";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { MaintenanceEvent } from "./types";

const statusToEventStatus: Record<string, string> = {
  pending: "scheduled",
  in_progress: "in-progress",
  completed: "completed",
  cancelled: "cancelled",
};

const assigneeName = (workOrder: WorkOrderWithRelations): string => {
  const first = workOrder.assignee?.first_name || "";
  const last = workOrder.assignee?.last_name || "";
  const name = `${first} ${last}`.trim();
  return name || "Unassigned";
};

export const workOrderToCalendarEvent = (workOrder: WorkOrderWithRelations): MaintenanceEvent => ({
  id: workOrder.id,
  title: workOrder.title,
  description: workOrder.description || "",
  date: new Date(workOrder.due_date as string),
  technician: assigneeName(workOrder),
  status: statusToEventStatus[workOrder.status] || workOrder.status,
  // Work orders carry no maintenance-type column; high-urgency work maps to
  // the corrective accent so the calendar still distinguishes severity.
  type: workOrder.priority === "high" || workOrder.priority === "urgent"
    ? "corrective"
    : "preventive",
  asset: workOrder.asset?.name || "—",
});

export const useCalendarEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: async () => {
      const workOrders = await getScheduledWorkOrders();
      return (workOrders as WorkOrderWithRelations[]).map(workOrderToCalendarEvent);
    },
  });

  const events = data || [];

  const technicianNames = [...new Set(events.map((event) => event.technician))]
    .filter((name) => name !== "Unassigned")
    .sort();

  const technicians = [
    { id: 0, name: "All Technicians", value: "all" },
    ...technicianNames.map((name, index) => ({
      id: index + 1,
      name,
      value: name,
    })),
  ];

  return { events, technicians, isLoading, error };
};
