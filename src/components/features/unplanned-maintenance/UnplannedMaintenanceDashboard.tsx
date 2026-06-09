
import React from "react";
import { isToday } from "date-fns";
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
 completedToday: items.filter(item => item.completedAt && isToday(item.completedAt)).length,
 reported: items.filter(item => item.status === 'reported').length
 };

 const cards = [
 {
 title: "Critical Issues",
 value: stats.critical,
 icon: AlertTriangle,
 color: "text-destructive",
 bgColor: "bg-destructive/10 border-destructive/30"
 },
 {
 title: "In Progress",
 value: stats.inProgress,
 icon: Wrench,
 color: "text-primary",
 bgColor: "bg-primary/10 border-primary/30"
 },
 {
 title: "Reported",
 value: stats.reported,
 icon: Clock,
 color: "text-warning",
 bgColor: "bg-warning/10 border-warning/30"
 },
 {
 title: "Completed Today",
 value: stats.completedToday,
 icon: CheckCircle,
 color: "text-success",
 bgColor: "bg-success/10 border-success/30"
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
