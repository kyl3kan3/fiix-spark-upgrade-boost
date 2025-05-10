
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, ClipboardList, Settings, User } from "lucide-react";

const DashboardRecentActivities = () => {
  const activities = [
    {
      id: 1,
      title: "Work Order Completed",
      description: "HVAC Filter Replacement",
      time: "2 hours ago",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      id: 2,
      title: "New Task Assigned",
      description: "Electrical System Inspection",
      time: "4 hours ago",
      icon: <ClipboardList className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 3,
      title: "Maintenance Scheduled",
      description: "Production Line B",
      time: "Yesterday",
      icon: <Calendar className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 4,
      title: "Asset Updated",
      description: "Forklift FL-102",
      time: "Yesterday",
      icon: <Settings className="h-4 w-4 text-orange-500" />,
    },
    {
      id: 5,
      title: "Team Member Added",
      description: "Sarah Johnson joined the team",
      time: "2 days ago",
      icon: <User className="h-4 w-4 text-indigo-500" />,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="relative pl-6 border-l border-gray-200 space-y-6 py-2">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pb-1">
              <span className="absolute -left-9 p-1 bg-white rounded-full">
                {activity.icon}
              </span>
              <div>
                <h4 className="text-sm font-medium">{activity.title}</h4>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivities;
