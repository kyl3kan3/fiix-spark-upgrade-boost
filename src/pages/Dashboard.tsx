
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clipboard, 
  LayoutDashboard, 
  LineChart, 
  LogOut,
  PlusCircle,
  Settings,
  User
} from "lucide-react";
import DashboardNotifications from "../components/dashboard/DashboardNotifications";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import DashboardRecentActivities from "../components/dashboard/DashboardRecentActivities";
import DashboardTasksOverview from "../components/dashboard/DashboardTasksOverview";

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

  const handleLogout = () => {
    // For now just navigate to home page
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header/Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-maintenease-600">MaintenEase</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {}}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
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
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <DashboardQuickActions />
            
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <DashboardRecentActivities />
              
              {/* Tasks Overview */}
              <DashboardTasksOverview />
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
                  View detailed analytics and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Work Order Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-[180px]">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                          <svg className="h-full w-full" viewBox="0 0 100 100">
                            <circle 
                              className="text-gray-100" 
                              strokeWidth="10" 
                              stroke="currentColor" 
                              fill="transparent" 
                              r="40" 
                              cx="50" 
                              cy="50" 
                            />
                            <circle 
                              className="text-maintenease-600" 
                              strokeWidth="10" 
                              strokeDasharray="251.2"
                              strokeDashoffset="62.8" 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                              fill="transparent" 
                              r="40" 
                              cx="50" 
                              cy="50" 
                            />
                          </svg>
                          <span className="absolute text-2xl font-bold">75%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-[180px]">
                        <div className="text-center">
                          <p className="text-3xl font-bold">4.2</p>
                          <p className="text-sm text-gray-500">hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-[180px]">
                        <div className="text-center">
                          <p className="text-3xl font-bold">$12,450</p>
                          <p className="text-sm text-gray-500">This month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Work Orders Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border">
                      <div className="flex flex-col items-center gap-2">
                        <LineChart className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-400">Chart visualization coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>Manage your pending tasks</CardDescription>
                </div>
                <Button size="sm" className="bg-maintenease-600 hover:bg-maintenease-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, title: "Review equipment inspection reports", dueDate: "2023-05-15", status: "pending", priority: "high" },
                    { id: 2, title: "Schedule preventive maintenance for Line B", dueDate: "2023-05-18", status: "in-progress", priority: "medium" },
                    { id: 3, title: "Order replacement parts for HVAC system", dueDate: "2023-05-20", status: "pending", priority: "medium" },
                    { id: 4, title: "Complete safety audit documentation", dueDate: "2023-05-22", status: "pending", priority: "high" },
                    { id: 5, title: "Train new maintenance staff", dueDate: "2023-05-25", status: "not-started", priority: "low" },
                  ].map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <CheckCircle className={`h-5 w-5 ${
                            task.status === "completed" 
                              ? "text-green-500 fill-green-500" 
                              : "text-gray-300"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                          ${task.priority === "high" ? "bg-red-100 text-red-800" : 
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-green-100 text-green-800"}`}
                        >
                          {task.priority}
                        </span>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Edit</span>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Mark All Complete</Button>
                <Button variant="outline">View All Tasks</Button>
              </CardFooter>
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
              <CardContent className="space-y-8 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="grid gap-4">
                    {[
                      { id: 1, title: "Email Notifications", description: "Receive email notifications for work orders", enabled: true },
                      { id: 2, title: "Push Notifications", description: "Receive push notifications on your browser", enabled: false },
                      { id: 3, title: "SMS Notifications", description: "Receive text message alerts for critical issues", enabled: false },
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{pref.title}</p>
                          <p className="text-sm text-gray-500">{pref.description}</p>
                        </div>
                        <div className={`h-6 w-11 rounded-full p-1 transition ${pref.enabled ? "bg-maintenease-600" : "bg-gray-200"}`}>
                          <div className={`h-4 w-4 rounded-full bg-white transition transform ${pref.enabled ? "translate-x-5" : ""}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme for the application</p>
                      </div>
                      <div className="h-6 w-11 rounded-full p-1 transition bg-gray-200">
                        <div className="h-4 w-4 rounded-full bg-white transition transform"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Dashboard Layout</p>
                        <p className="text-sm text-gray-500">Choose your preferred dashboard layout</p>
                      </div>
                      <select className="border rounded-md px-2 py-1 text-sm">
                        <option>Default</option>
                        <option>Compact</option>
                        <option>Detailed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-maintenease-600 hover:bg-maintenease-700 ml-auto">Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Notifications Panel */}
        <DashboardNotifications />
      </div>
    </div>
  );
};

export default Dashboard;
