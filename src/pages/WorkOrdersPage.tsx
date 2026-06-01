import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MaterialIcon from "@/components/ui/material-icon";
import { useWorkOrders } from "@/components/workOrders/useWorkOrders";
import { useWorkOrderNavigation } from "@/components/workOrders/hooks/useWorkOrderNavigation";
import { WorkOrderWithRelations } from "@/types/workOrders";

// Helper: compute a fake progress percentage from status
function statusProgress(wo: WorkOrderWithRelations): number {
  switch (wo.status) {
    case "completed": return 100;
    case "in_progress": return 45;
    case "pending": return 10;
    case "cancelled": return 0;
    default: return 0;
  }
}

// Helper: progress SVG ring
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

const WorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, isLoading } = useWorkOrders();
  const { handleViewWorkOrder, handleEditWorkOrder, handleCreateWorkOrder } = useWorkOrderNavigation();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const goNew = () => navigate("/work-orders/new");

  // Derive stats from real data
  const activeCount = workOrders.filter((wo) => wo.status === "pending" || wo.status === "in_progress").length;
  const pendingCount = workOrders.filter((wo) => wo.status === "pending").length;
  const completedCount = workOrders.filter((wo) => wo.status === "completed").length;

  // Filter work orders by tab
  const filtered = workOrders.filter((wo) => {
    if (activeTab === "pending") return wo.status === "pending";
    if (activeTab === "overdue") {
      if (!wo.due_date) return false;
      return new Date(wo.due_date) < new Date() && wo.status !== "completed";
    }
    return true;
  });

  // Circumference ratios for stats bar rings
  const activeOffset = activeCount > 0 ? Math.max(0, 175.9 - (activeCount / Math.max(activeCount, 1)) * 175.9 * 0.75) : 175.9;
  const pendingOffset = pendingCount > 0 ? Math.max(0, 175.9 * 0.75) : 175.9;
  const completedOffset = completedCount > 0 ? 0 : 175.9;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Work Orders | MaintenEase</title>
      </Helmet>

      {/* Canvas */}
      <div className="px-gutter pt-8 pb-16">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
              Work Order Management
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              Oversee asset health and maintenance workflows with precision.
            </p>
          </div>
          <button
            onClick={goNew}
            className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md text-label-md shadow-level-1 hover:shadow-level-2 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
          >
            <MaterialIcon name="add" />
            REPORT A PROBLEM
          </button>
        </div>

        {/* Stats Bar - Bento Grid Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
          {/* Active Requests */}
          <div className="p-card_padding rounded-xl shadow-level-1 hover:shadow-level-2 transition-all duration-300 flex justify-between items-center group bg-surface-container-lowest">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Active Requests</p>
              <h3 className="font-headline-lg text-headline-lg">{isLoading ? "—" : activeCount}</h3>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-primary/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4" />
                <circle className="text-primary transition-all duration-500" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={activeOffset} strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-headline-md text-headline-md text-primary">
                {isLoading ? "—" : activeCount}
              </div>
            </div>
          </div>
          {/* Pending Approval */}
          <div className="p-card_padding rounded-xl shadow-level-1 hover:shadow-level-2 transition-all duration-300 flex justify-between items-center bg-surface-container-lowest">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Pending Approval</p>
              <h3 className="font-headline-lg text-headline-lg">{isLoading ? "—" : pendingCount}</h3>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-[#F59E0B]/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4" />
                <circle className="text-[#F59E0B]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={pendingOffset} strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-headline-md text-headline-md text-[#F59E0B]">
                {isLoading ? "—" : pendingCount}
              </div>
            </div>
          </div>
          {/* Completed */}
          <div className="p-card_padding rounded-xl shadow-level-1 hover:shadow-level-2 transition-all duration-300 flex justify-between items-center bg-surface-container-lowest">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Completed This Week</p>
              <h3 className="font-headline-lg text-headline-lg">{isLoading ? "—" : completedCount}</h3>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-[#10B981]/10" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4" />
                <circle className="text-[#10B981]" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={completedOffset} strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-headline-md text-headline-md text-[#10B981]">
                {isLoading ? "—" : completedCount}
              </div>
            </div>
          </div>
        </div>

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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-surface-container-low rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/40">
            <MaterialIcon name="assignment" className="text-5xl text-on-surface-variant/30 mb-4 block" />
            <p className="font-headline-md text-headline-md text-on-surface mb-1">No work orders found</p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              {activeTab !== "all" ? "Try changing the filter above." : "Create your first work order to get started."}
            </p>
            <button
              onClick={goNew}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md shadow-sm hover:shadow-md transition-all"
            >
              <MaterialIcon name="add" />
              New Work Order
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={goNew}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-label-md text-label-md shadow-level-1 hover:shadow-level-2 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
        >
          <MaterialIcon name="add" />
        </button>
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersPage;
