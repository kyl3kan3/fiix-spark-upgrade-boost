import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, ClipboardList, FileText, Wrench, Users, CheckSquare } from "lucide-react";

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
      icon: <ClipboardList className="h-5 w-5" />, 
      color: "bg-blue-100 text-blue-700",
      onClick: () => handleActionClick("New Work Order", "/work-orders/new") 
    },
    { 
      title: "Schedule Maintenance", 
      icon: <CalendarPlus className="h-5 w-5" />, 
      color: "bg-green-100 text-green-700",
      onClick: () => handleActionClick("Schedule Maintenance", "/calendar") 
    },
    { 
      title: "Asset Management", 
      icon: <Wrench className="h-5 w-5" />, 
      color: "bg-purple-100 text-purple-700",
      onClick: () => handleActionClick("Asset Management", "/assets") 
    },
    { 
      title: "Inspections", 
      icon: <CheckSquare className="h-5 w-5" />, 
      color: "bg-indigo-100 text-indigo-700",
      onClick: () => handleActionClick("Inspections", "/inspections")
    },
    { 
      title: "Reports", 
      icon: <FileText className="h-5 w-5" />, 
      color: "bg-yellow-100 text-yellow-700",
      onClick: () => handleActionClick("Reports", "/reports") 
    }
  ];
  
  return (
    <Card className="card-gradient dark:card-gradient-dark glass-morphism dark:glass-morphism-dark shadow-lg rounded-2xl animate-entry">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg dark:text-gray-200">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col h-auto py-6 px-3 border rounded-lg hover-scale ${action.color} animate-entry`}
              onClick={() => action.onClick()}
              tabIndex={0}
            >
              <div className={`p-2 rounded-full mb-3`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium dark:text-gray-100">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
