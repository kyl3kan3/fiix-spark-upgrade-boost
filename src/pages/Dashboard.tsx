import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, ClipboardList, HardHat } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TodaySnapshot } from "@/components/dashboard/snapshot/TodaySnapshot";
import { RecentWorkOrders } from "@/components/dashboard/snapshot/RecentWorkOrders";
import { GetStartedPanel } from "@/components/dashboard/snapshot/GetStartedPanel";

const Dashboard: React.FC = () => {
  const { userName, companyName, isLoading } = useDashboardData();
  const {
    workOrders,
    stats,
    isLoading: workOrdersLoading,
  } = useWorkOrdersData();
  const { teamMembers } = useTeamMembers();

  const totalTechs = teamMembers.length;
  const activeTechs = teamMembers.filter((member) => member.online).length;

  const completed = stats.completed;
  const totalForRate = stats.completed + stats.open + stats.inProgress;
  const completionRate =
    totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : null;
  const highPriorityPendingJobs = workOrders.filter(
    (workOrder) =>
      workOrder.status === "pending" &&
      ["high", "urgent"].includes(workOrder.priority ?? ""),
  ).length;
  const pendingAssetLabels = workOrders
    .filter((workOrder) => workOrder.status === "pending")
    .map((workOrder) => workOrder.asset?.name || workOrder.title)
    .filter((label): label is string => Boolean(label))
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
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=2" />
        <meta property="og:url" content="https://maintenease.com/dashboard" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dashboard | MaintenEase" />
        <meta name="twitter:description" content="Your MaintenEase workspace overview — track work orders, technician activity, and facility KPIs at a glance." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=2" />
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
          members={teamMembers}
          isLoading={workOrdersLoading}
        />

        {!workOrdersLoading && workOrders.length === 0 ? (
          <GetStartedPanel />
        ) : (
          <RecentWorkOrders workOrders={workOrders} />
        )}

        <section className="mt-8">
          <h3 className="font-headline text-xl text-foreground mb-4">
            Quick actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              href="/work-orders"
              icon={ClipboardList}
              label="All work orders"
            />
            <QuickAction
              href="/checklists/due"
              icon={CheckCircle2}
              label="Due checklists"
            />
            <QuickAction href="/team" icon={HardHat} label="Team schedule" />
          </div>
        </section>
      </PageContainer>
    </DashboardLayout>
  );
};

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={href}
      className="surface-card flex items-center justify-between p-5 group"
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-medium text-foreground">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default Dashboard;
