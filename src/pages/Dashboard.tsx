import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import type { WorkOrderWithRelations } from "@/types/workOrders";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard", active: true },
  { label: "Work Orders", icon: "assignment_turned_in", href: "/work-orders" },
  { label: "Assets", icon: "precision_manufacturing", href: "/assets" },
  { label: "Inventory", icon: "inventory_2", href: "/assets" },
  { label: "Preventive", icon: "event_repeat", href: "/maintenance" },
  { label: "Reporting", icon: "analytics", href: "/reports" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getFirstName = (name?: string | null) => {
  const cleanName = name?.trim();
  return cleanName ? cleanName.split(/\s+/)[0] : "Alex";
};

const isOpenWorkOrder = (workOrder: WorkOrderWithRelations) =>
  workOrder.status === "pending" || workOrder.status === "in_progress";

const getCompletionRate = (workOrders: WorkOrderWithRelations[]) => {
  if (workOrders.length === 0) return 86;

  const completed = workOrders.filter(
    (workOrder) => workOrder.status === "completed",
  ).length;
  return Math.round((completed / workOrders.length) * 100);
};

const getDisplayDay = () => {
  const formattedDate = dateFormatter.format(new Date());
  const day = new Date().getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return formattedDate.replace(String(day), `${day}${suffix}`);
};

const MaterialIcon = ({
  children,
  className = "text-2xl",
}: {
  children: string;
  className?: string;
}) => (
  <span className={`material-symbols-outlined ${className}`}>{children}</span>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { userName } = useDashboardData();
  const { workOrders, isLoading } = useWorkOrdersData();

  const displayName = getFirstName(userName);
  const todayLabel = getDisplayDay();
  const hasLiveWorkOrders = workOrders.length > 0;

  const pendingJobs = useMemo(
    () => workOrders.filter(isOpenWorkOrder),
    [workOrders],
  );
  const completionRate = useMemo(
    () => getCompletionRate(workOrders),
    [workOrders],
  );
  const highPriorityCount = useMemo(
    () =>
      pendingJobs.filter(
        (workOrder) =>
          workOrder.priority === "high" || workOrder.priority === "urgent",
      ).length,
    [pendingJobs],
  );
  const tradeTags = useMemo(() => {
    const assetNames = pendingJobs
      .map((workOrder) => workOrder.asset?.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 2);

    return assetNames.length > 0 ? assetNames : ["HVAC Unit B", "Plumbing L1"];
  }, [pendingJobs]);
  const activeTechs = useMemo(() => {
    const uniqueAssignees = new Set(
      workOrders
        .map((workOrder) => workOrder.assignee?.id)
        .filter((id): id is string => Boolean(id)),
    );
    return uniqueAssignees.size;
  }, [workOrders]);

  const displayedPendingJobs = isLoading
    ? "—"
    : hasLiveWorkOrders
      ? pendingJobs.length
      : 24;
  const displayedHighPriority = hasLiveWorkOrders ? highPriorityCount : 3;
  const displayedActiveTechs = isLoading ? "—" : activeTechs || 12;
  const displayedTotalTechs = Math.max(activeTechs, 15);
  const progressOffset = 100 - completionRate;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    const matchingWorkOrder = workOrders.find((workOrder) =>
      `${workOrder.title} ${workOrder.description ?? ""} ${workOrder.asset?.name ?? ""}`
        .toLowerCase()
        .includes(query),
    );

    if (matchingWorkOrder) {
      navigate(`/work-orders/${matchingWorkOrder.id}`);
      return;
    }

    navigate(`/work-orders?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - MaintenEase</title>
        <meta
          name="description"
          content="Clean tech MaintenEase dashboard for work orders, assets, technicians, and daily facility operations."
        />
        <link rel="canonical" href="https://maintenease.com/dashboard" />
        <meta property="og:title" content="Dashboard - MaintenEase" />
        <meta
          property="og:description"
          content="Daily facility snapshot with completion rate, pending jobs, active technicians, search, and app navigation."
        />
        <meta property="og:url" content="https://maintenease.com/dashboard" />
      </Helmet>

      <div className="flex min-h-screen bg-[#f8f9ff] font-['Inter',sans-serif] text-[#0b1c30]">
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col gap-2 border-r border-[#c5c5d4]/20 bg-white py-6 shadow-sm transition-all duration-300 ease-in-out md:flex">
          <div className="mb-2 px-8 pb-6">
            <Link to="/dashboard">
              <h1 className="font-['Playfair_Display',serif] text-[24px] font-semibold leading-[1.3] text-[#00175c]">
                MaintenEase
              </h1>
              <p className="mt-1 text-[12px] font-medium leading-[1.4] text-[#5c5f61]">
                Facility Management
              </p>
            </Link>
          </div>

          <div className="mb-6 px-6">
            <Link
              to="/work-orders/new"
              className="flex w-full items-center justify-center rounded bg-[#00175c] py-3 text-[14px] font-semibold uppercase leading-[1.4] tracking-[0.01em] text-white shadow-sm transition-shadow hover:shadow-md"
            >
              New Work Order
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 rounded-r-full border-l-4 px-4 py-3 transition-all duration-200 ${
                  item.active
                    ? "border-[#00175c] bg-[#00175c]/5 font-bold text-[#00175c] hover:bg-[#e5eeff]"
                    : "translate-x-1 border-transparent text-[#5c5f61] hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                }`}
              >
                <MaterialIcon>{item.icon}</MaterialIcon>
                <span className="text-[14px] font-semibold leading-[1.4] tracking-[0.01em]">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-[#c5c5d4]/20 px-4 pt-4">
            <Link
              to="/help"
              className="flex translate-x-1 items-center gap-3 rounded-r-full border-l-4 border-transparent px-4 py-2 text-[#5c5f61] transition-all duration-200 hover:bg-[#e5eeff] hover:text-[#0b1c30]"
            >
              <MaterialIcon>help_outline</MaterialIcon>
              <span className="text-[14px] font-semibold leading-[1.4] tracking-[0.01em]">
                Support
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex translate-x-1 items-center gap-3 rounded-r-full border-l-4 border-transparent px-4 py-2 text-left text-[#5c5f61] transition-all duration-200 hover:bg-[#e5eeff] hover:text-[#0b1c30]"
            >
              <MaterialIcon>logout</MaterialIcon>
              <span className="text-[14px] font-semibold leading-[1.4] tracking-[0.01em]">
                Logout
              </span>
            </button>
          </div>
        </aside>

        <main className="ml-0 flex min-h-screen flex-1 flex-col md:ml-[240px]">
          <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-[#c5c5d4]/30 bg-[#f8f9ff]/80 px-8 py-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                className="rounded-full p-2 text-[#444652] transition-colors hover:bg-[#e5eeff] md:hidden"
                type="button"
              >
                <MaterialIcon>menu</MaterialIcon>
              </button>
              <h1 className="font-['Playfair_Display',serif] text-[24px] font-semibold leading-[1.3] tracking-tight text-[#00175c] md:hidden">
                MaintenEase
              </h1>
              <form
                onSubmit={handleSearch}
                className="hidden items-center rounded-full bg-[#eff4ff] px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-[#00175c] md:flex"
              >
                <MaterialIcon className="mr-2 text-[#5c5f61]">
                  search
                </MaterialIcon>
                <input
                  aria-label="Search orders and assets"
                  className="w-64 border-none bg-transparent text-[16px] font-normal leading-[1.5] text-[#0b1c30] outline-none placeholder:text-[#5c5f61] focus:ring-0"
                  placeholder="Search orders, assets..."
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/settings/notifications"
                className="rounded-full p-2 text-[#444652] transition-colors duration-200 hover:bg-[#dce9ff] active:opacity-80"
                aria-label="Notifications"
              >
                <MaterialIcon>notifications</MaterialIcon>
              </Link>
              <Link
                to="/help"
                className="hidden rounded-full p-2 text-[#444652] transition-colors duration-200 hover:bg-[#dce9ff] active:opacity-80 sm:block"
                aria-label="Help"
              >
                <MaterialIcon>help</MaterialIcon>
              </Link>
              <Link
                to="/settings"
                className="hidden rounded-full p-2 text-[#444652] transition-colors duration-200 hover:bg-[#dce9ff] active:opacity-80 sm:block"
                aria-label="Settings"
              >
                <MaterialIcon>settings</MaterialIcon>
              </Link>
              <Link
                to="/profile"
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#00288e] text-sm font-bold text-[#7e97fe] shadow-sm"
                aria-label="Profile"
              >
                {displayName.charAt(0).toUpperCase()}
              </Link>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="mb-2 font-['Playfair_Display',serif] text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#0b1c30]">
                  {getGreeting()}, {displayName}.
                </h2>
                <p className="text-[18px] font-normal leading-[1.6] text-[#5c5f61]">
                  Here is your facility overview for today, {todayLabel}.
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-4 font-['Playfair_Display',serif] text-[24px] font-semibold leading-[1.3] text-[#0b1c30]">
                Today's Snapshot
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <article className="group relative flex flex-col overflow-hidden rounded-xl border border-transparent bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00175c]/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <MaterialIcon className="text-6xl text-[#10B981]">
                      check_circle
                    </MaterialIcon>
                  </div>
                  <div className="z-10 mb-6 flex items-start justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold uppercase leading-[1.4] tracking-wider text-[#5c5f61]">
                        Completion Rate
                      </h4>
                      <p className="mt-1 font-['Playfair_Display',serif] text-[32px] font-bold leading-[1.2] text-[#0b1c30]">
                        {isLoading ? "—" : `${completionRate}%`}
                      </p>
                    </div>
                    <div className="relative h-16 w-16">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                          className="text-[#d3e4fe]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="origin-center -rotate-90 text-[#10B981] transition-[stroke-dashoffset] duration-700 ease-in-out"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="100, 100"
                          strokeDashoffset={progressOffset}
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="z-10 mt-auto border-t border-[#c5c5d4]/20 pt-4">
                    <p className="flex items-center gap-1 text-[12px] font-medium leading-[1.4] text-[#10B981]">
                      <MaterialIcon className="text-sm">
                        trending_up
                      </MaterialIcon>
                      +2% from yesterday
                    </p>
                  </div>
                </article>

                <article className="group relative flex flex-col overflow-hidden rounded-xl border border-transparent bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00175c]/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <MaterialIcon className="text-6xl text-[#F59E0B]">
                      pending_actions
                    </MaterialIcon>
                  </div>
                  <div className="z-10 mb-6 flex items-start justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold uppercase leading-[1.4] tracking-wider text-[#5c5f61]">
                        Pending Jobs
                      </h4>
                      <p className="mt-1 font-['Playfair_Display',serif] text-[32px] font-bold leading-[1.2] text-[#0b1c30]">
                        {displayedPendingJobs}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded bg-[#F59E0B]/10 px-2 py-1 text-[12px] font-bold leading-[1.4] text-[#F59E0B]">
                      <MaterialIcon className="text-sm">error</MaterialIcon>
                      {displayedHighPriority} High
                    </div>
                  </div>
                  <div className="z-10 mt-auto flex gap-2 border-t border-[#c5c5d4]/20 pt-4">
                    {tradeTags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold uppercase ${
                          index === 0
                            ? "bg-[#ffdad6] text-[#93000a]"
                            : "bg-[#e5eeff] text-[#0b1c30]"
                        }`}
                      >
                        {tag.length > 14 ? `${tag.slice(0, 14)}…` : tag}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="group relative flex flex-col overflow-hidden rounded-xl border border-transparent bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00175c]/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <MaterialIcon className="text-6xl text-[#00175c]">
                      engineering
                    </MaterialIcon>
                  </div>
                  <div className="z-10 mb-6 flex items-start justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold uppercase leading-[1.4] tracking-wider text-[#5c5f61]">
                        Active Techs
                      </h4>
                      <p className="mt-1 font-['Playfair_Display',serif] text-[32px] font-bold leading-[1.2] text-[#0b1c30]">
                        {displayedActiveTechs}{" "}
                        <span className="text-[16px] font-normal leading-[1.5] text-[#5c5f61]">
                          / {displayedTotalTechs}
                        </span>
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="z-30 h-8 w-8 rounded-full border-2 border-white bg-[#d3e4fe]" />
                      <div className="z-20 h-8 w-8 rounded-full border-2 border-white bg-[#dee0e2]" />
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#00288e] text-[10px] text-[#7e97fe]">
                        +9
                      </div>
                    </div>
                  </div>
                  <div className="z-10 mt-auto border-t border-[#c5c5d4]/20 pt-4">
                    <Link
                      to="/team"
                      className="flex items-center gap-1 text-[12px] font-medium leading-[1.4] text-[#00175c] hover:underline"
                    >
                      View Schedule
                      <MaterialIcon className="text-sm">
                        arrow_forward
                      </MaterialIcon>
                    </Link>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
