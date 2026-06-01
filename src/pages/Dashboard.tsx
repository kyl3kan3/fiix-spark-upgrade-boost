import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, ClipboardList, HardHat } from "lucide-react";
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
  const { stats, isLoading: workOrdersLoading } = useWorkOrdersData();
  const { teamMembers } = useTeamMembers();

  const totalTechs = teamMembers.length;
  const activeTechs = teamMembers.filter((m) => m.isOnline).length;

  const completed = stats.completed;
  const totalForRate = stats.completed + stats.open + stats.inProgress;
  const completionRate = totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : null;

  const today = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard | MaintenEase</title>
      </Helmet>

      <PageContainer>
        <header className="mb-8">
          <h2 className="font-headline text-3xl sm:text-4xl text-foreground tracking-tight mb-2">
            {isLoading ? "Loading…" : `Hello${userName ? `, ${userName.split(" ")[0]}` : ""}.`}
          </h2>
          <p className="text-base text-muted-foreground">
            Here is your {companyName ? `${companyName} ` : ""}facility overview for today, {today}.
          </p>
        </header>

        <TodaySnapshot
          completionRate={completionRate}
          pendingJobs={stats.open}
          activeTechs={activeTechs}
          totalTechs={totalTechs}
          isLoading={workOrdersLoading}
        />

        <section className="mt-8">
          <h3 className="font-headline text-xl text-foreground mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction href="/work-orders" icon={ClipboardList} label="All work orders" />
            <QuickAction href="/checklists/due" icon={CheckCircle2} label="Due checklists" />
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
    <a
      href={href}
      className="surface-card flex items-center justify-between p-5 group"
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-medium text-foreground">{label}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export default Dashboard;
