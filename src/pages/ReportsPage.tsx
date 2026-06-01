import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Helmet } from "react-helmet-async";
import MaterialIcon from "@/components/ui/material-icon";

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Reports | MaintenEase</title>
        <meta name="description" content="Maintenance reports and analytics: work order completion, asset health, inspection trends, and team performance summaries for your facility." />
        <link rel="canonical" href="https://maintenease.com/reports" />
      </Helmet>

      <div className="p-4 md:p-container_padding flex-1 overflow-y-auto bg-surface-blue">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Date Filter */}
            <div className="relative bg-surface-container-lowest rounded-lg shadow-[0px_4px_8px_rgba(0,0,0,0.02)] flex items-center px-4 py-2 cursor-pointer hover:shadow-[0px_10px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <MaterialIcon name="calendar_month" className="text-on-surface-variant mr-2 text-[20px]" />
              <span className="font-label-md text-label-md text-on-surface mr-4">Last 30 Days</span>
              <MaterialIcon name="expand_more" className="text-on-surface-variant text-[20px]" />
            </div>
            {/* Department Filter */}
            <div className="relative bg-surface-container-lowest rounded-lg shadow-[0px_4px_8px_rgba(0,0,0,0.02)] flex items-center px-4 py-2 cursor-pointer hover:shadow-[0px_10px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <MaterialIcon name="domain" className="text-on-surface-variant mr-2 text-[20px]" />
              <span className="font-label-md text-label-md text-on-surface mr-4">All Facilities</span>
              <MaterialIcon name="expand_more" className="text-on-surface-variant text-[20px]" />
            </div>
          </div>
          {/* Generate Report CTA */}
          <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md uppercase hover:bg-primary-container transition-colors shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95 duration-150 w-full sm:w-auto justify-center">
            <MaterialIcon name="download" className="text-[20px]" />
            Generate Report
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* KPI 1: Uptime */}
          <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-xl p-card_padding shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-primary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Asset Uptime</p>
                <h3 className="font-display-lg text-display-lg text-on-surface mt-1">98.4%</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <MaterialIcon name="trending_up" className="text-success" filled />
              </div>
            </div>
            <div className="flex items-center gap-2 text-success">
              <MaterialIcon name="arrow_upward" className="text-[16px]" />
              <span className="font-label-sm text-label-sm font-semibold">+1.2% from last month</span>
            </div>
          </div>

          {/* KPI 2: Open Work Orders */}
          <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-xl p-card_padding shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-primary/10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Open Orders</p>
                <h3 className="font-display-lg text-display-lg text-on-surface mt-1">124</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <MaterialIcon name="warning" className="text-warning" filled />
              </div>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 mb-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">45% require immediate attention</p>
          </div>

          {/* KPI 3: MTD Cost */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-primary text-on-primary rounded-xl p-card_padding shadow-[0px_10px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.15)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className="font-label-md text-label-md text-inverse-primary uppercase tracking-wider">MTD Spend</p>
                <h3 className="font-display-lg text-display-lg text-on-primary mt-1">$42.8k</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <MaterialIcon name="payments" className="text-on-primary" filled />
              </div>
            </div>
            <div className="flex items-center gap-2 text-inverse-primary relative z-10">
              <MaterialIcon name="arrow_downward" className="text-[16px]" />
              <span className="font-label-sm text-label-sm font-semibold">-5.4% vs Budget</span>
            </div>
          </div>

          {/* Main Chart: Completion Trends */}
          <div className="col-span-1 md:col-span-2 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-transparent hover:border-primary/10 transition-colors p-card_padding">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">Completion Trends</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Preventative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-surface-tint"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Reactive</span>
                </div>
              </div>
            </div>
            {/* CSS Bar Chart Representation */}
            <div className="h-[250px] flex items-end justify-between gap-2 pt-4 relative">
              {/* Y-axis lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[30px] z-0">
                <div className="w-full border-b border-surface-container-high border-dashed h-0"></div>
                <div className="w-full border-b border-surface-container-high border-dashed h-0"></div>
                <div className="w-full border-b border-surface-container-high border-dashed h-0"></div>
                <div className="w-full border-b border-surface-container-high border-dashed h-0"></div>
              </div>
              {/* Bars (Jan - Jun) */}
              {[
                { label: "Jan", prev: "60%", react: "40%" },
                { label: "Feb", prev: "75%", react: "35%" },
                { label: "Mar", prev: "85%", react: "25%" },
                { label: "Apr", prev: "95%", react: "45%" },
                { label: "May", prev: "70%", react: "55%" },
                { label: "Jun", prev: "80%", react: "30%" },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center flex-1 z-10 gap-2">
                  <div className="flex items-end gap-1 w-full h-[220px] justify-center">
                    <div className="w-1/3 bg-primary rounded-t-md" style={{ height: bar.prev }}></div>
                    <div className="w-1/3 bg-surface-tint rounded-t-md" style={{ height: bar.react }}></div>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Chart: Cost Distribution */}
          <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-transparent hover:border-primary/10 transition-colors p-card_padding flex flex-col">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Cost by Department</h3>
            <div className="flex-1 flex flex-col justify-center gap-6">
              {[
                { label: "HVAC Systems", pct: 42, color: "bg-primary" },
                { label: "Plumbing", pct: 28, color: "bg-surface-tint" },
                { label: "Electrical", pct: 18, color: "bg-on-primary-container" },
                { label: "General Facility", pct: 12, color: "bg-outline" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between font-label-sm text-label-sm mb-2">
                    <span className="text-on-surface font-semibold">{item.label}</span>
                    <span className="text-on-surface-variant">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
