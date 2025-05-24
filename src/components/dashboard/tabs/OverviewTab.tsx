
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, stats, isLoading } = useWorkOrdersData();
  
  return (
    <div className="space-y-6 animate-entry">
      {/* Quick Actions */}
      <div className="animate-entry">
        <DashboardQuickActions />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-200">Total Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-200">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.open}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-200">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{stats.inProgress}</p>
          </CardContent>
        </Card>
        
        <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-200">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
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
      <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
          <CardDescription>
            Your most recent maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center p-6 text-gray-500">
                Loading work orders...
              </div>
            ) : workOrders.length > 0 ? (
              workOrders.slice(0, 5).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.title}</p>
                    <p className="text-sm text-gray-500">{order.description}</p>
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
                      ${order.status === "pending" ? "bg-blue-100 text-blue-800" : 
                        order.status === "in_progress" ? "bg-purple-100 text-purple-800" : 
                        "bg-green-100 text-green-800"}`}
                    >
                      {order.status.replace('_', ' ')}
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
            onClick={() => navigate("/work-orders")}
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
