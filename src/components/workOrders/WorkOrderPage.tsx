import React, { useState } from "react";
import { useWorkOrders } from "./useWorkOrders";
import { useWorkOrderNavigation } from "./hooks/useWorkOrderNavigation";
import EmptyWorkOrdersState from "./EmptyWorkOrdersState";
import MaterialIcon from "@/components/ui/material-icon";
import { WorkOrderWithRelations } from "@/types/workOrders";

// Helper: compute a progress percentage from status
function statusProgress(wo: WorkOrderWithRelations): number {
  switch (wo.status) {
    case "completed": return 100;
    case "in_progress": return 45;
    case "pending": return 10;
    case "cancelled": return 0;
    default: return 0;
  }
}

// Progress ring SVG
function ProgressRing({ pct }: { pct: number }) {
  const circumference = 175.9;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-primary/10"
          cx="32" cy="32" fill="transparent" r="28"
          stroke="currentColor" strokeWidth="4"
        />
        <circle
          className="text-primary transition-all duration-500"
          cx="32" cy="32" fill="transparent" r="28"
          stroke="currentColor"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeWidth="4"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-label-md text-label-md text-on-surface">
        {pct}%
      </div>
    </div>
  );
}

// Priority badge
function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const map: Record<string, string> = {
    urgent: "bg-error-container text-error",
    high: "bg-error-container text-error",
    medium: "bg-primary-container text-primary",
    low: "bg-surface-container-highest text-primary",
  };
  const label: Record<string, string> = {
    urgent: "Urgent",
    high: "High Priority",
    medium: "Normal",
    low: "Low Priority",
  };
  const cls = map[priority] ?? "bg-surface-container text-on-surface";
  return (
    <span className={`${cls} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
      {label[priority] ?? priority}
    </span>
  );
}

type FilterTab = "all" | "pending" | "overdue";

export const WorkOrderPage: React.FC = () => {
  const { workOrders, isLoading } = useWorkOrders();
  const { handleCreateWorkOrder, handleViewWorkOrder, handleEditWorkOrder } =
    useWorkOrderNavigation();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <div className="h-11 w-64 bg-surface-container-high rounded-lg animate-pulse" />
          <div className="h-11 w-24 bg-surface-container-high rounded-full animate-pulse" />
          <div className="h-11 w-28 bg-surface-container-high rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (workOrders.length === 0) {
    return <EmptyWorkOrdersState onCreateWorkOrder={handleCreateWorkOrder} />;
  }

  const filtered = workOrders.filter((wo) => {
    if (activeTab === "pending") return wo.status === "pending";
    if (activeTab === "overdue") {
      if (!wo.due_date) return false;
      return new Date(wo.due_date) < new Date() && wo.status !== "completed";
    }
    return true;
  });

  return (
    <div>
      {/* Filters & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex bg-surface-container rounded-lg p-1">
          {(["all", "pending", "overdue"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md font-label-md text-label-md transition-all ${
                activeTab === tab
                  ? "bg-white shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
            <MaterialIcon name="filter_list" className="text-[20px]" />
            Sort by: Priority
          </button>
          <button className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
            <MaterialIcon name="view_agenda" className="text-[20px]" />
            Grid View
          </button>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {filtered.map((wo) => {
          const pct = statusProgress(wo);
          const assigneeName = wo.assignee
            ? `${wo.assignee.first_name?.[0] ?? ""}. ${wo.assignee.last_name ?? ""}`.trim()
            : "—";
          const dueLabel = wo.due_date
            ? new Date(wo.due_date).toLocaleDateString()
            : wo.status === "completed" ? "Completed" : "—";

          return (
            <div
              key={wo.id}
              className="rounded-xl shadow-level-1 hover:shadow-level-2 transition-all duration-300 group overflow-hidden border border-transparent hover:border-primary/10 bg-surface-container-lowest"
            >
              <div className="p-card_padding">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider">
                    #{wo.id.slice(0, 8).toUpperCase()}
                  </span>
                  <PriorityBadge priority={wo.priority} />
                </div>
                <div className="flex gap-6 items-center">
                  <ProgressRing pct={pct} />
                  <div>
                    <h4 className="font-headline-md text-headline-md text-on-surface mb-1">{wo.title}</h4>
                    <p className="text-on-surface-variant font-body-md line-clamp-2">
                      {wo.description ?? "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-outline-variant/10 pt-6">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">Technician</p>
                    <p className="font-label-md text-label-md">{assigneeName || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">Due Date</p>
                    <p className="font-label-md text-label-md">{dueLabel}</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-low px-card_padding py-4 flex justify-between items-center group-hover:bg-surface-container-high transition-colors">
                <button
                  onClick={() => handleViewWorkOrder(wo)}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline"
                >
                  <MaterialIcon name="visibility" className="text-[18px]" /> VIEW
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditWorkOrder(wo)}
                    className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <MaterialIcon name="edit" className="text-[18px]" /> EDIT
                  </button>
                  {wo.status !== "completed" && wo.status !== "cancelled" && (
                    <button
                      className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-[#10B981] transition-colors"
                    >
                      <MaterialIcon name="check_circle" className="text-[18px]" /> COMPLETE
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
