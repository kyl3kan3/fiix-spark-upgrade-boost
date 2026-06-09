import { describe, expect, it } from "vitest";
import { workOrderToCalendarEvent } from "../useCalendarEvents";
import { WorkOrderWithRelations } from "@/types/workOrders";

const baseWorkOrder = {
  id: "wo-1",
  title: "Replace compressor belt",
  description: "Quarterly PM",
  due_date: "2026-06-15T14:30:00.000Z",
  status: "pending",
  priority: "medium",
  asset_id: null,
  assigned_to: null,
  company_id: null,
  vendor_id: null,
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
  created_by: "user-1",
} as unknown as WorkOrderWithRelations;

describe("workOrderToCalendarEvent", () => {
  it("maps core fields onto a calendar event", () => {
    const event = workOrderToCalendarEvent(baseWorkOrder);

    expect(event.id).toBe("wo-1");
    expect(event.title).toBe("Replace compressor belt");
    expect(event.description).toBe("Quarterly PM");
    expect(event.date).toEqual(new Date("2026-06-15T14:30:00.000Z"));
  });

  it("maps work order statuses to calendar statuses", () => {
    const statuses: Array<[string, string]> = [
      ["pending", "scheduled"],
      ["in_progress", "in-progress"],
      ["completed", "completed"],
      ["cancelled", "cancelled"],
    ];

    for (const [status, expected] of statuses) {
      const event = workOrderToCalendarEvent({
        ...baseWorkOrder,
        status,
      } as WorkOrderWithRelations);
      expect(event.status).toBe(expected);
    }
  });

  it("uses the corrective accent for high and urgent priorities", () => {
    for (const priority of ["high", "urgent"]) {
      const event = workOrderToCalendarEvent({
        ...baseWorkOrder,
        priority,
      } as WorkOrderWithRelations);
      expect(event.type).toBe("corrective");
    }

    for (const priority of ["low", "medium"]) {
      const event = workOrderToCalendarEvent({
        ...baseWorkOrder,
        priority,
      } as WorkOrderWithRelations);
      expect(event.type).toBe("preventive");
    }
  });

  it("falls back to Unassigned when there is no assignee", () => {
    expect(workOrderToCalendarEvent(baseWorkOrder).technician).toBe("Unassigned");

    const assigned = workOrderToCalendarEvent({
      ...baseWorkOrder,
      assignee: { first_name: "Dana", last_name: "Reyes" },
    } as WorkOrderWithRelations);
    expect(assigned.technician).toBe("Dana Reyes");
  });

  it("falls back to a dash when there is no asset", () => {
    expect(workOrderToCalendarEvent(baseWorkOrder).asset).toBe("—");

    const withAsset = workOrderToCalendarEvent({
      ...baseWorkOrder,
      asset: { name: "Freezer #2" },
    } as WorkOrderWithRelations);
    expect(withAsset.asset).toBe("Freezer #2");
  });
});
