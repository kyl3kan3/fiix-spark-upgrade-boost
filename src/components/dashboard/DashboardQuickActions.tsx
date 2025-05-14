
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CalendarDays, 
  Wrench, 
  CheckSquare,
  FileBarChart 
} from "lucide-react";

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (action: string, path: string) => {
    // Add debug information
    console.log(`Attempting to navigate to: ${path} for action: ${action}`);
    
    // Navigate directly without any conditional checks
    if (path) {
      navigate(path);
      toast.info(`Navigating to ${action}`);
    }
  };
  
  const quickActions = [
    { 
      title: "New Work Order", 
      icon: <FileText className="h-6 w-6" color="#3b82f6" />, 
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: () => handleActionClick("New Work Order", "/work-orders/new") 
    },
    { 
      title: "Schedule Maintenance", 
      icon: <CalendarDays className="h-6 w-6" color="#22c55e" />, 
      color: "bg-green-50 text-green-700 hover:bg-green-100",
      onClick: () => handleActionClick("Schedule Maintenance", "/calendar") 
    },
    { 
      title: "Asset Management", 
      icon: <Wrench className="h-6 w-6" color="#a855f7" />, 
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      onClick: () => handleActionClick("Asset Management", "/assets") 
    },
    { 
      title: "Inspections", 
      icon: <CheckSquare className="h-6 w-6" color="#6366f1" />, 
      color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      onClick: () => handleActionClick("Inspections", "/inspections")
    },
    { 
      title: "Reports", 
      icon: <FileBarChart className="h-6 w-6" color="#ca8a04" />, 
      color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      onClick: () => handleActionClick("Reports", "/reports") 
    }
  ];
  
  return (
    <Card className="bg-gray-50/90 border-gray-100 shadow-sm rounded-2xl animate-entry">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col items-center justify-center h-32 py-4 px-2 rounded-lg transition-all ${action.color} animate-entry`}
              onClick={() => action.onClick()}
              tabIndex={0}
            >
              <div className="mb-2">
                {action.icon}
              </div>
              <span className="text-base font-medium text-center">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
