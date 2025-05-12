
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, ClipboardList, FileText, Settings, Wrench, Users } from "lucide-react";

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (action: string, path?: string) => {
    if (path) {
      navigate(path);
    } else {
      toast.success(`${action} action initiated`, {
        description: "This functionality will be implemented soon."
      });
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
      title: "Team Members", 
      icon: <Users className="h-5 w-5" />, 
      color: "bg-orange-100 text-orange-700",
      onClick: () => handleActionClick("Team Members", "/team") 
    },
    { 
      title: "Reports", 
      icon: <FileText className="h-5 w-5" />, 
      color: "bg-yellow-100 text-yellow-700",
      onClick: () => handleActionClick("Reports", "/reports") 
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="flex flex-col h-auto py-6 px-3 border rounded-lg hover:bg-gray-50"
              onClick={action.onClick}
            >
              <div className={`${action.color} p-2 rounded-full mb-3`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
