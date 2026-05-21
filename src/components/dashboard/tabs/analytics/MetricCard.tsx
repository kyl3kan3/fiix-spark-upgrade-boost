
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MetricCardProps {
 title: string;
 children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, children }) => {
 return (
 <Card className="min-w-0">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-center min-h-[180px]">
 {children}
 </div>
 </CardContent>
 </Card>
 );
};

export default MetricCard;
