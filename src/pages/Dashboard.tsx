import React from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TodaySnapshot } from "@/components/dashboard/snapshot/TodaySnapshot";

/**
 * Workspace home — Clean Tech executive overview.
 *
 * The TopBar (from AppShell) renders the greeting + name. This page renders
 * the "Today's Snapshot" KPI bento per dashboard_maintenease_clean_tech/code.html.
 */
const Dashboard: React.FC = () => {
  const { userName, companyName, isLoading } = useDashboardData();
  const {
    workOrders,
    stats,
    isLoading: workOrdersLoading,
  } = useWorkOrdersData();
  const { teamMembers } = useTeamMembers();

  const totalTechs = teamMembers.length;
  const activeTechs = teamMembers.filter((m) => m.online).length;

  const completed = stats.completed;
  const totalForRate = stats.completed + stats.open + stats.inProgress;
  const completionRate =
    totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : null;
  const highPriorityPendingJobs = workOrders.filter(
    (wo) =>
      wo.status === "pending" &&
      ["high", "critical"].includes(wo.priority ?? ""),
  ).length;
  const pendingAssetLabels = workOrders
    .filter((wo) => wo.status === "pending")
    .map((wo) => wo.asset?.name || wo.title)
    .filter(Boolean)
    .slice(0, 2);

  const today = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard | MaintenEase</title>
        <meta
          name="description"
          content="Your MaintenEase workspace overview — track work orders, technician activity, and facility KPIs at a glance."
        />
        <meta property="og:title" content="Dashboard | MaintenEase" />
        <meta
          property="og:description"
          content="Your MaintenEase workspace overview — track work orders, technician activity, and facility KPIs at a glance."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://maintenease.com/og-image.png"
        />
      </Helmet>

      <PageContainer>
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-4xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-5xl mb-2">
              {isLoading
                ? "Loading…"
                : `Hello${userName ? `, ${userName.split(" ")[0]}` : ""}.`}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Here is your {companyName ? `${companyName} ` : ""}facility
              overview for today, {today}.
            </p>
          </div>
        </header>

        <TodaySnapshot
          completionRate={completionRate}
          pendingJobs={stats.open}
          activeTechs={activeTechs}
          totalTechs={totalTechs}
          highPriorityPendingJobs={highPriorityPendingJobs}
          pendingAssetLabels={pendingAssetLabels}
          isLoading={workOrdersLoading}
        />
      </PageContainer>
    </DashboardLayout>
  );
};

export default Dashboard;
