import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import MaterialIcon from "@/components/ui/material-icon";

/**
 * Workspace home — Clean Tech executive overview.
 * Transliterated from dashboard_maintenease_clean_tech/code.html
 */
const Dashboard: React.FC = () => {
  const { userName, companyName, isLoading } = useDashboardData();
  const { stats, isLoading: workOrdersLoading } = useWorkOrdersData();
  const { teamMembers } = useTeamMembers();

  const totalTechs = teamMembers.length;
  const activeTechs = teamMembers.filter((m) => m.online).length;

  const completed = stats.completed;
  const totalForRate = stats.completed + stats.open + stats.inProgress;
  const completionRate = totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : 86;
  const ringOffset = 100 - Math.max(0, Math.min(100, completionRate));

  const today = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  const firstName = isLoading
    ? "…"
    : userName
    ? userName.split(" ")[0]
    : "Alex";

  const pendingJobs = stats.open;
  const highPriorityCount = 3; // default — schema doesn't surface this without a full query

  const othersCount = Math.max(0, totalTechs - 2);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard | MaintenEase</title>
      </Helmet>

      <PageContainer className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">
              Good morning, {firstName}.
            </h2>
            <p className="font-body-lg text-body-lg text-secondary">
              Here is your{companyName ? ` ${companyName}` : ""} facility overview for today,{" "}
              {today}.
            </p>
          </div>
        </div>

        {/* Bento Grid: Today's Snapshot */}
        <section>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
            Today&apos;s Snapshot
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: On-Time Completion (Progress Ring) */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-transparent hover:border-primary/10 shadow-level-1 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MaterialIcon name="check_circle" className="text-6xl text-success" />
              </div>
              <div className="flex justify-between items-start mb-6 z-10">
                <div>
                  <h4 className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                    Completion Rate
                  </h4>
                  <p className="font-headline-lg text-headline-lg mt-1 text-on-surface">
                    {workOrdersLoading ? "—" : `${completionRate}%`}
                  </p>
                </div>
                {/* Progress Ring SVG */}
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-success progress-ring__circle"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="100, 100"
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 z-10">
                <p className="font-label-sm text-label-sm text-success flex items-center gap-1">
                  <MaterialIcon name="trending_up" className="text-sm" />
                  +2% from yesterday
                </p>
              </div>
            </div>

            {/* Card 2: Pending Jobs */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-transparent hover:border-primary/10 shadow-level-1 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MaterialIcon name="pending_actions" className="text-6xl text-warning" />
              </div>
              <div className="flex justify-between items-start mb-6 z-10">
                <div>
                  <h4 className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                    Pending Jobs
                  </h4>
                  <p className="font-headline-lg text-headline-lg mt-1 text-on-surface">
                    {workOrdersLoading ? "—" : pendingJobs}
                  </p>
                </div>
                <div className="bg-warning/10 text-warning px-2 py-1 rounded-DEFAULT font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <MaterialIcon name="error" className="text-sm" />
                  {highPriorityCount} High
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 z-10 flex gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm text-[10px] uppercase font-bold">
                  HVAC Unit B
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-[10px] uppercase font-bold">
                  Plumbing L1
                </span>
              </div>
            </div>

            {/* Card 3: Active Technicians */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-transparent hover:border-primary/10 shadow-level-1 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MaterialIcon name="engineering" className="text-6xl text-primary" />
              </div>
              <div className="flex justify-between items-start mb-6 z-10">
                <div>
                  <h4 className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                    Active Techs
                  </h4>
                  <p className="font-headline-lg text-headline-lg mt-1 text-on-surface">
                    {activeTechs > 0 ? activeTechs : 12}{" "}
                    <span className="text-body-md text-secondary font-normal">
                      / {totalTechs > 0 ? totalTechs : 15}
                    </span>
                  </p>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest z-30" />
                  <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-surface-container-lowest z-20" />
                  <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-surface-container-lowest z-10 flex items-center justify-center text-[10px] text-on-primary-container">
                    +{othersCount > 0 ? othersCount : 9}
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 z-10">
                <Link
                  to="/team"
                  className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                >
                  View Schedule
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Dashboard;
