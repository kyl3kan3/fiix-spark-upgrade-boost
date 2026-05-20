
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const DashboardActivityCard: React.FC = () => {
 return (
 <Card className="bg-card border-border shadow-sm animate-entry mb-4" style={{ animationDelay: "200ms" }}>
 <CardHeader className="p-3 md:p-4">
 <CardTitle className="text-base md:text-lg flex items-center gap-2">
 <Clock className="h-4 w-4 md:h-5 md:w-5 text-maintenease-500" />
 Recent Activity
 </CardTitle>
 </CardHeader>
 <CardContent className="p-3 md:p-6">
 <div className="text-center py-4 md:py-8 text-muted-foreground text-sm">
 No recent activities to display
 </div>
 </CardContent>
 </Card>
 );
};

export default DashboardActivityCard;
