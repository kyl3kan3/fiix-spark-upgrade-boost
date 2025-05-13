
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Fade in and scale animation for sections
const FadeInSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`animate-fade-in animate-scale-in ${className ?? ""}`}>{children}</div>
);

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  // State for dashboard data
  const [workOrderStats, setWorkOrderStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);

  useEffect(() => {
    // In a real implementation, this would fetch data from the backend
    // For now, we'll just use empty data
  }, []);

  return (
    <div className="relative min-h-screen w-full py-10 px-2 sm:px-4 md:px-10 overflow-x-hidden bg-[radial-gradient(ellipse_at_55%_14%,rgba(0,175,135,0.11)_0%,rgba(255,255,255,0)_85%)] dark:bg-[radial-gradient(ellipse_at_55%_14%,rgba(0,140,108,0.23)_0%,rgba(30,32,34,0.6)_75%)] transition-colors duration-700">
      {/* Subtle Decor Gradient Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{
          background: "linear-gradient(108deg,rgba(242,245,139,0.23) 16.7%,rgba(148,197,20,0.13) 79.2%)",
          filter: "blur(8px)",
        }}
      />
      {/* Extra top glow */}
      <div className="absolute top-0 left-0 right-0 h-24 z-0 bg-gradient-to-b from-white/50 to-transparent dark:from-maintenease-700/40 dark:to-transparent" />
      {/* Dashboard Content */}
      <FadeInSection className="relative z-10 space-y-7">
        {/* Title & intro */}
        <div className="pb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-maintenease-700 dark:text-white drop-shadow-sm mb-1 animate-fade-in">
            Welcome to your Dashboard
          </h1>
          <p className="max-w-lg text-base text-gray-500 dark:text-gray-300">
            All your maintenance essentials, one beautiful workspace.
          </p>
        </div>
        {/* Quick Actions */}
        <FadeInSection className="animate-slide-up">
          <DashboardQuickActions />
        </FadeInSection>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          <Card className="glass shadow-xl transition hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-700 dark:text-maintenease-100">Total Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-maintenease-50 drop-shadow">{workOrderStats.total}</p>
            </CardContent>
          </Card>
          <Card className="glass shadow-xl transition hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-yellow-700/85">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-yellow-500 drop-shadow">{workOrderStats.open}</p>
            </CardContent>
          </Card>
          <Card className="glass shadow-xl transition hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-blue-700/85">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-blue-500 drop-shadow">{workOrderStats.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="glass shadow-xl transition hover-scale">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-green-700/85">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-green-500 drop-shadow">{workOrderStats.completed}</p>
            </CardContent>
          </Card>
        </div>
        {/* Activity + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeInSection className="animate-slide-up">
            <DashboardRecentActivities />
          </FadeInSection>
          <FadeInSection className="animate-slide-up delay-75">
            <DashboardTasksOverview />
          </FadeInSection>
        </div>
        {/* Recent Work Orders */}
        <FadeInSection className="animate-slide-up delay-100">
          <Card className="glass shadow-2xl transition hover-scale">
            <CardHeader>
              <CardTitle className="font-bold">Recent Work Orders</CardTitle>
              <CardDescription>
                Your most recent maintenance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorkOrders.length > 0 ? (
                  recentWorkOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-maintenease-100/50 glass transition"
                    >
                      <div>
                        <p className="font-medium">{order.title}</p>
                        <p className="text-sm text-gray-500">{order.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                          ${order.priority === "high" ? "bg-red-100 text-red-800" :
                            order.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"}`}
                        >
                          {order.priority}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                          ${order.status === "open" ? "bg-blue-100 text-blue-800" :
                            order.status === "in-progress" ? "bg-purple-100 text-purple-800" :
                            "bg-green-100 text-green-800"}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 text-gray-400 italic">
                    No work orders available
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => navigate("/feature/Work%20Order%20Management")}
                className="w-full font-semibold bg-maintenease-600/90 text-white hover:bg-maintenease-700/90 transition rounded-lg shadow-lg"
              >
                View All Work Orders
              </Button>
            </CardFooter>
          </Card>
        </FadeInSection>
      </FadeInSection>
    </div>
  );
};

export default OverviewTab;
