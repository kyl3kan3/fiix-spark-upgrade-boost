import { useQuery } from "@tanstack/react-query";
import {
  fetchActivityWindow,
  fetchOpenWorkOrderPriorities,
} from "@/services/dashboardActivityService";

/**
 * Weekly maintenance-activity series for the dashboard chart: work orders
 * opened vs completed over the last 6 weeks, plus the priority mix of
 * currently open work.
 *
 * "Completed in week N" approximates completion time with updated_at (the
 * schema has no completed_at); the last touch of a completed work order is
 * its status flip in practice.
 */

const WEEKS = 6;

export interface WeeklyActivity {
  weekStart: Date;
  label: string;
  opened: number;
  completed: number;
}

export interface PrioritySlice {
  priority: "urgent" | "high" | "medium" | "low";
  count: number;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday start, matching the calendar page
  return d;
}

export function useMaintenanceActivity() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-maintenance-activity"],
    queryFn: async () => {
      const windowStart = startOfWeek(new Date());
      windowStart.setDate(windowStart.getDate() - (WEEKS - 1) * 7);

      const [activityRows, openRows] = await Promise.all([
        fetchActivityWindow(windowStart.toISOString()),
        fetchOpenWorkOrderPriorities(),
      ]);

      const weeks: WeeklyActivity[] = Array.from({ length: WEEKS }, (_, i) => {
        const weekStart = new Date(windowStart);
        weekStart.setDate(weekStart.getDate() + i * 7);
        return {
          weekStart,
          label: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          opened: 0,
          completed: 0,
        };
      });

      const bucketIndex = (iso: string) => {
        const t = new Date(iso).getTime();
        const i = Math.floor((t - windowStart.getTime()) / (7 * 24 * 3600 * 1000));
        return i >= 0 && i < WEEKS ? i : -1;
      };

      for (const wo of activityRows) {
        const openedAt = bucketIndex(wo.created_at);
        if (openedAt >= 0) weeks[openedAt].opened += 1;
        if (wo.status === "completed") {
          const completedAt = bucketIndex(wo.updated_at);
          if (completedAt >= 0) weeks[completedAt].completed += 1;
        }
      }

      const priorityCounts: Record<PrioritySlice["priority"], number> = {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
      for (const wo of openRows) {
        const p = (wo.priority ?? "medium") as PrioritySlice["priority"];
        if (p in priorityCounts) priorityCounts[p] += 1;
      }
      const priorities: PrioritySlice[] = (
        ["urgent", "high", "medium", "low"] as const
      ).map((priority) => ({ priority, count: priorityCounts[priority] }));

      const totalActivity = weeks.reduce((sum, w) => sum + w.opened + w.completed, 0);
      const totalOpen = priorities.reduce((sum, p) => sum + p.count, 0);

      return { weeks, priorities, totalActivity, totalOpen };
    },
  });

  return {
    weeks: data?.weeks ?? [],
    priorities: data?.priorities ?? [],
    totalActivity: data?.totalActivity ?? 0,
    totalOpen: data?.totalOpen ?? 0,
    isLoading,
    error,
  };
}
