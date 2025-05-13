
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Animation helper for fade/scale in
const FadeInSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-fade-in animate-scale-in">{children}</div>
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

  // Fetch real data when available
  useEffect(() => {
    // In a real implementation, this would fetch data from the backend
    // For now, we'll just use empty data
  }, []);
  
  return (
    <div className="relative min-h-screen w-full py-8 px-0 sm:px-2 md:px-6">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-maintenease-100/70 via-white/80 to-maintenease-50/90 blur-[1.5px]" />
      
      {/* Dashboard Content */}
      <FadeInSection>
        <div className="relative z-10 space-y-6">
          {/* Quick Actions */}
          <DashboardQuickActions />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass shadow-lg hover-scale transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-600/95">Total Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900 drop-shadow-sm">{workOrderStats.total}</p>
              </CardContent>
            </Card>
            
            <Card className="glass shadow-lg hover-scale transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-yellow-700/85">Open</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-yellow-500 drop-shadow">{workOrderStats.open}</p>
              </CardContent>
            </Card>
            
            <Card className="glass shadow-lg hover-scale transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-blue-700/85">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-blue-500 drop-shadow">{workOrderStats.inProgress}</p>
              </CardContent>
            </Card>
            
            <Card className="glass shadow-lg hover-scale transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-green-700/85">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-green-500 drop-shadow">{workOrderStats.completed}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <DashboardRecentActivities />
            
            {/* Tasks Overview */}
            <DashboardTasksOverview />
          </div>
          
          {/* Recent Work Orders */}
          <Card className="glass shadow-xl hover-scale transition-all">
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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-maintenease-100/60 glass transition"
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
                className="w-full font-semibold bg-maintenease-600/80 text-white hover:bg-maintenease-700/95 transition"
              >
                View All Work Orders
              </Button>
            </CardFooter>
          </Card>
        </div>
      </FadeInSection>
    </div>
  );
};

export default OverviewTab;
