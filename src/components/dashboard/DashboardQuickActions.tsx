
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
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardQuickActions = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleActionClick = (action: string, path: string) => {
    // Add debug information
    console.log(`Attempting to navigate to: ${path} for action: ${action}`);
    
    // Navigate directly without any conditional checks
    if (path) {
      navigate(path);
      toast.info(`Navigating to ${action}`);
    }
  };
  
  const allActions = [
    { 
      title: "New Work Order", 
      icon: <FileText className="h-5 w-5 md:h-6 md:w-6" color="#3b82f6" />, 
      color: "bg-blue-100/80 border-blue-200",
      textColor: "text-blue-700",
      onClick: () => handleActionClick("New Work Order", "/work-orders/new") 
    },
    { 
      title: "Schedule Maintenance", 
      icon: <CalendarDays className="h-5 w-5 md:h-6 md:w-6" color="#22c55e" />, 
      color: "bg-green-100/80 border-green-200",
      textColor: "text-green-700",
      onClick: () => handleActionClick("Schedule Maintenance", "/calendar") 
    },
    { 
      title: "Asset Management", 
      icon: <Wrench className="h-5 w-5 md:h-6 md:w-6" color="#a855f7" />, 
      color: "bg-purple-100/80 border-purple-200",
      textColor: "text-purple-700",
      onClick: () => handleActionClick("Asset Management", "/assets") 
    },
    { 
      title: "Inspections", 
      icon: <CheckSquare className="h-5 w-5 md:h-6 md:w-6" color="#6366f1" />, 
      color: "bg-indigo-100/80 border-indigo-200",
      textColor: "text-indigo-700",
      onClick: () => handleActionClick("Inspections", "/inspections")
    },
    { 
      title: "Reports", 
      icon: <FileBarChart className="h-5 w-5 md:h-6 md:w-6" color="#ca8a04" />, 
      color: "bg-yellow-100/80 border-yellow-200",
      textColor: "text-yellow-700",
      onClick: () => handleActionClick("Reports", "/reports") 
    }
  ];
  
  // Show fewer actions on mobile
  const quickActions = isMobile ? allActions.slice(0, 3) : allActions;
  
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-xl animate-entry">
      <CardHeader className="pb-1 md:pb-2">
        <CardTitle className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.onClick()}
              className={`flex flex-col items-center justify-center p-2 md:p-4 h-[100px] md:h-[120px] rounded-lg border transition-all ${action.color} hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary animate-entry`}
            >
              <div className="mb-2 md:mb-3">
                {action.icon}
              </div>
              <span className={`${action.textColor} text-xs md:text-sm text-center`}>{action.title}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
