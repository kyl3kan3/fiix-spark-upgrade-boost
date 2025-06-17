
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, Wrench } from "lucide-react";
import { UnplannedMaintenanceItem } from "./types";

interface UnplannedMaintenanceDashboardProps {
  items: UnplannedMaintenanceItem[];
}

const UnplannedMaintenanceDashboard: React.FC<UnplannedMaintenanceDashboardProps> = ({ items }) => {
  const stats = {
    total: items.length,
    critical: items.filter(item => item.urgency === 'critical' && item.status !== 'completed').length,
    inProgress: items.filter(item => item.status === 'in_progress').length,
    completed: items.filter(item => item.status === 'completed').length,
    awaitingParts: items.filter(item => item.status === 'awaiting_parts').length
  };

  const cards = [
    {
      title: "Critical Issues",
      value: stats.critical,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200"
    },
    {
      title: "Awaiting Parts",
      value: stats.awaitingParts,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "Completed Today",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UnplannedMaintenanceDashboard;
