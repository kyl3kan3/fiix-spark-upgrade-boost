import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

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
    <div className="space-y-6 animate-entry">
      {/* Quick Actions */}
      <div className="animate-entry">
        <DashboardQuickActions />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gradient shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Total Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{workOrderStats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{workOrderStats.open}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{workOrderStats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{workOrderStats.completed}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="animate-entry">
          <DashboardRecentActivities />
        </div>
        
        {/* Tasks Overview */}
        <div className="animate-entry">
          <DashboardTasksOverview />
        </div>
      </div>
      
      {/* Recent Work Orders */}
      <Card className="card-gradient shadow-lg rounded-2xl animate-entry">
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.title}</p>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                      ${order.priority === "high" ? "bg-red-100 text-red-800" : 
                        order.priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-green-100 text-green-800"}`}
                    >
                      {order.priority}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
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
              <div className="text-center p-6 text-gray-500">
                No work orders available
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => navigate("/feature/Work%20Order%20Management")}
            className="w-full"
          >
            View All Work Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OverviewTab;
