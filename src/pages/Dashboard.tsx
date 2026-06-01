import React from "react";
import { Helmet } from "react-helmet-async";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Box,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Search,
  User,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import logo from "@/assets/maintenease-logo.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Work Orders", icon: ClipboardList },
  { label: "Assets", icon: Box },
  { label: "Preventive Maintenance", icon: Wrench },
  { label: "Reports", icon: BarChart3 },
];

const stats = [
  { label: "Total Work Orders (YTD)", value: "1,245" },
  { label: "MTTR (Last Month)", value: "4.2 hours" },
  { label: "Asset Health Score", value: "85%" },
  { label: "Open Requests", value: "18" },
];

const trendData = [
  { month: "Jan", completed: 8, newlyCreated: 0 },
  { month: "Feb", completed: 54, newlyCreated: 34 },
  { month: "Mar", completed: 82, newlyCreated: 50 },
  { month: "Apr", completed: 96, newlyCreated: 65 },
  { month: "May", completed: 104, newlyCreated: 72 },
  { month: "Jun", completed: 134, newlyCreated: 86 },
];

const maintenanceStatus = [
  { name: "Planned", value: 56, color: "#00606d" },
  { name: "Reactive", value: 32, color: "#2fb7ad" },
  { name: "Overdue", value: 12, color: "#e65d4f" },
];

const activities = [
  { title: "WO-2301 completed by John D.", time: "7 mins ago", active: true },
  { title: "New asset HVAC Unit B added", time: "1 hour ago" },
  { title: "New asset HVAC Unit B added", time: "1 hour ago" },
  { title: "PM schedule updated for Conveyor 4", time: "27 mins ago" },
  { title: "PM schedule updated for Conveyor 4", time: "27 mins ago" },
];

const alerts = [
  { title: "High temp warning on Compressor C", time: "10 mins ago", tone: "critical" },
  { title: "Low stock: Hydraulic Fluid", time: "1 hours ago", tone: "warning" },
  { title: "PM overdue for Elevator 1", time: "2 mins ago", tone: "critical" },
];

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | MaintenEase</title>
        <meta
          name="description"
          content="Executive MaintenEase dashboard with work-order trends, maintenance status, recent activities, and urgent alerts."
        />
        <link rel="canonical" href="https://maintenease.com/dashboard" />
        <meta property="og:title" content="Dashboard | MaintenEase" />
        <meta
          property="og:description"
          content="Work-order trends, asset health, open requests, and urgent maintenance alerts at a glance."
        />
        <meta property="og:url" content="https://maintenease.com/dashboard" />
      </Helmet>

      <main className="min-h-screen bg-[#eaf8f7] px-3 py-6 text-[#071314] sm:px-6 lg:px-10 lg:py-12">
        <section className="mx-auto flex w-full max-w-[1080px] overflow-hidden rounded-[10px] bg-white shadow-[0_22px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
          <aside className="hidden w-[174px] shrink-0 bg-gradient-to-b from-[#00606d] to-[#004f5b] text-white md:block">
            <div className="flex items-center gap-2 px-4 pb-7 pt-4">
              <img src={logo} alt="MaintenEase" className="h-8 w-8 rounded-md object-contain" />
              <span className="text-[14px] font-semibold tracking-tight text-[#dff8f5]">MaintenEase</span>
            </div>

            <nav className="space-y-2 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex h-9 w-full items-center gap-2 rounded-[5px] px-3 text-left text-[10px] font-semibold transition-colors ${
                      item.active ? "bg-white/16 text-white shadow-sm" : "text-[#d9f4f0] hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 bg-[#f7f9fb]">
            <header className="flex h-[55px] items-center justify-between border-b border-[#dfe8ea] bg-white px-4 sm:px-5">
              <h1 className="text-[18px] font-bold tracking-tight text-[#071314]">Dashboard</h1>

              <div className="flex items-center gap-3">
                <label className="hidden h-[22px] w-[170px] items-center gap-1.5 rounded-full border border-[#ccdadd] bg-white px-3 text-[#627174] sm:flex">
                  <Search className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Search</span>
                </label>
                <Bell className="h-4 w-4 text-[#364547]" strokeWidth={2.2} />
                <div className="flex items-center gap-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#11181a] text-white">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-[#6c7779]">⌄</span>
                </div>
              </div>
            </header>

            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_222px]">
              <section className="min-w-0 space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <article
                      key={stat.label}
                      className="rounded-[6px] border border-[#d6e1e4] bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    >
                      <p className="text-[10px] font-bold leading-tight text-[#182426]">{stat.label}</p>
                      <p className="mt-2 text-[24px] font-bold leading-none tracking-tight text-[#071314]">{stat.value}</p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
                  <article className="rounded-[7px] border border-[#d6e1e4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <h2 className="mb-4 text-[12px] font-bold text-[#071314]">Work Order Trends (Last 6 Months)</h2>
                    <div className="h-[220px] min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="newWorkOrders" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#55c9c3" stopOpacity={0.45} />
                              <stop offset="100%" stopColor="#55c9c3" stopOpacity={0.06} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#dfe7e8" strokeDasharray="0" vertical={false} />
                          <XAxis
                            axisLine={false}
                            dataKey="month"
                            tick={{ fill: "#1f2b2d", fontSize: 10, fontWeight: 600 }}
                            tickLine={false}
                          />
                          <YAxis
                            axisLine={false}
                            domain={[0, 150]}
                            tick={{ fill: "#1f2b2d", fontSize: 10, fontWeight: 600 }}
                            tickLine={false}
                          />
                          <Area
                            dataKey="newlyCreated"
                            fill="url(#newWorkOrders)"
                            stroke="#2fb7ad"
                            strokeWidth={2.2}
                            type="monotone"
                          />
                          <Line
                            dataKey="completed"
                            dot={false}
                            stroke="#00606d"
                            strokeWidth={2.4}
                            type="monotone"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 flex justify-center gap-5 text-[10px] font-semibold text-[#233133]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#00606d]" /> Completed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2fb7ad]" /> New
                      </span>
                    </div>
                  </article>

                  <article className="rounded-[7px] border border-[#d6e1e4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <h2 className="text-[12px] font-bold text-[#071314]">Maintenance Status</h2>
                    <div className="mx-auto h-[206px] max-w-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            cx="50%"
                            cy="50%"
                            data={maintenanceStatus}
                            dataKey="value"
                            innerRadius="48%"
                            outerRadius="77%"
                            paddingAngle={0}
                            stroke="#ffffff"
                            strokeWidth={2}
                          >
                            {maintenanceStatus.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-[#233133]">
                      {maintenanceStatus.map((item) => (
                        <span key={item.name} className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              </section>

              <aside className="space-y-4 lg:min-w-0">
                <article className="rounded-[7px] border border-[#d6e1e4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h2 className="mb-3 text-[12px] font-bold text-[#071314]">Recent Activities</h2>
                  <ol className="space-y-0">
                    {activities.map((activity, index) => (
                      <li key={`${activity.title}-${index}`} className="grid grid-cols-[14px_1fr] gap-2">
                        <div className="flex flex-col items-center pt-0.5">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                              activity.active ? "border-[#13b9aa] bg-[#13b9aa]" : "border-[#b8cacc] bg-white"
                            }`}
                          >
                            {activity.active && <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />}
                          </span>
                          {index !== activities.length - 1 && <span className="h-7 w-px bg-[#c8d7d9]" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-[10px] font-bold leading-tight text-[#071314]">{activity.title}</p>
                          <p className="mt-0.5 text-[9px] font-semibold leading-tight text-[#738082]">{activity.time}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="rounded-[7px] border border-[#d6e1e4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h2 className="mb-3 text-[12px] font-bold text-[#071314]">Urgent Alerts</h2>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.title} className="flex gap-2">
                        <AlertTriangle
                          className={alert.tone === "critical" ? "h-4 w-4 shrink-0 text-[#e65d4f]" : "h-4 w-4 shrink-0 text-[#f0a72d]"}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                        <div>
                          <p className="text-[10px] font-bold leading-tight text-[#071314]">{alert.title}</p>
                          <p className="mt-0.5 text-[9px] font-semibold leading-tight text-[#738082]">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Dashboard;
