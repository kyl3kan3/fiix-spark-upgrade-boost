
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
      color: "bg-blue-100/80 border-blue-200",
      textColor: "text-blue-700",
      onClick: () => handleActionClick("New Work Order", "/work-orders/new") 
    },
    { 
      title: "Schedule Maintenance", 
      icon: <CalendarDays className="h-6 w-6" color="#22c55e" />, 
      color: "bg-green-100/80 border-green-200",
      textColor: "text-green-700",
      onClick: () => handleActionClick("Schedule Maintenance", "/calendar") 
    },
    { 
      title: "Asset Management", 
      icon: <Wrench className="h-6 w-6" color="#a855f7" />, 
      color: "bg-purple-100/80 border-purple-200",
      textColor: "text-purple-700",
      onClick: () => handleActionClick("Asset Management", "/assets") 
    },
    { 
      title: "Inspections", 
      icon: <CheckSquare className="h-6 w-6" color="#6366f1" />, 
      color: "bg-indigo-100/80 border-indigo-200",
      textColor: "text-indigo-700",
      onClick: () => handleActionClick("Inspections", "/inspections")
    },
    { 
      title: "Reports", 
      icon: <FileBarChart className="h-6 w-6" color="#ca8a04" />, 
      color: "bg-yellow-100/80 border-yellow-200",
      textColor: "text-yellow-700",
      onClick: () => handleActionClick("Reports", "/reports") 
    }
  ];
  
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl animate-entry">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.onClick()}
              className={`flex flex-col items-center justify-center p-4 h-[140px] rounded-xl border transition-all ${action.color} hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-entry`}
            >
              <div className="mb-3">
                {action.icon}
              </div>
              <span className={`${action.textColor} text-base font-medium text-center`}>{action.title}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
