
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data for dashboard elements
  const workOrderStats = {
    total: 24,
    open: 8,
    inProgress: 12,
    completed: 4,
  };
  
  const recentWorkOrders = [
    { id: "WO-2023-154", title: "HVAC Maintenance", status: "in-progress", priority: "medium" },
    { id: "WO-2023-153", title: "Leaking Pipe Repair", status: "open", priority: "high" },
    { id: "WO-2023-152", title: "Light Fixture Replacement", status: "completed", priority: "low" },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-maintenease-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <Button 
            onClick={() => navigate("/feature/Work%20Order%20Management")} 
            className="bg-maintenease-600 hover:bg-maintenease-700"
          >
            Create Work Order
          </Button>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Total Work Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{workOrderStats.total}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-500">{workOrderStats.open}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-500">{workOrderStats.inProgress}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-500">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{workOrderStats.completed}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Work Orders</CardTitle>
                <CardDescription>
                  Your most recent maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWorkOrders.map((order) => (
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
                  ))}
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
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View detailed analytics and reports (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your preferences and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
