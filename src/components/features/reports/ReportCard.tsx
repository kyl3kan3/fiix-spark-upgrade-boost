
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, LineChart } from "lucide-react";

interface ReportCardProps {
 title: string;
 description: string;
 icon: "bar" | "pie" | "line";
 onGenerate: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onGenerate }) => {
 return (
 <Card className="bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
 <CardContent className="pt-6">
 <div className="text-center mb-4">
 <div className={`${getIconBackground(icon)} p-3 rounded-full inline-block mb-3`}>
 {icon === "bar" && <BarChart3 className={`h-6 w-6 ${getIconColor(icon)}`} />}
 {icon === "pie" && <PieChart className={`h-6 w-6 ${getIconColor(icon)}`} />}
 {icon === "line" && <LineChart className={`h-6 w-6 ${getIconColor(icon)}`} />}
 </div>
 <h3 className="font-headline font-semibold text-foreground text-base">{title}</h3>
 </div>
 <p className="text-sm text-muted-foreground mb-4 text-center">{description}</p>
 <Button
 className="w-full bg-primary hover:bg-primary-variant text-primary-foreground"
 onClick={onGenerate}
 >
 Generate Report
 </Button>
 </CardContent>
 </Card>
 );
};

const getIconBackground = (icon: string): string => {
 switch (icon) {
 case "bar": return "bg-primary/10";
 case "pie": return "bg-success/10";
 case "line": return "bg-secondary/10";
 default: return "bg-muted";
 }
};

const getIconColor = (icon: string): string => {
 switch (icon) {
 case "bar": return "text-primary";
 case "pie": return "text-success";
 case "line": return "text-secondary";
 default: return "text-foreground";
 }
};

export default ReportCard;
