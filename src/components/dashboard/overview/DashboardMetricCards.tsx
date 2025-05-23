
import React from "react";
import { FileText, CheckSquare, Users, Calendar } from "lucide-react";
import DashboardMetricCard from "./DashboardMetricCard";

const DashboardMetricCards: React.FC = () => {
  const metricCards = [
    {
      title: "Work Orders",
      description: "10 pending",
      icon: FileText,
      iconColor: "blue",
      iconBgColor: "blue",
      buttonColor: "blue",
      navigateTo: "/work-orders",
      animationDelay: "0ms"
    },
    {
      title: "Inspections",
      description: "5 scheduled",
      icon: CheckSquare,
      iconColor: "green",
      iconBgColor: "green",
      buttonColor: "green",
      navigateTo: "/inspections",
      animationDelay: "50ms"
    },
    {
      title: "Team",
      description: "Manage members",
      icon: Users,
      iconColor: "purple",
      iconBgColor: "purple",
      buttonColor: "purple", 
      navigateTo: "/team",
      animationDelay: "100ms"
    },
    {
      title: "Calendar",
      description: "3 events today",
      icon: Calendar,
      iconColor: "amber",
      iconBgColor: "amber",
      buttonColor: "amber",
      navigateTo: "/calendar",
      animationDelay: "150ms"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card, index) => (
        <DashboardMetricCard
          key={index}
          {...card}
        />
      ))}
    </div>
  );
};

export default DashboardMetricCards;
