
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
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className={`${getIconBackground(icon)} p-3 rounded-full inline-block mb-2`}>
            {icon === "bar" && <BarChart3 className={`h-6 w-6 ${getIconColor(icon)}`} />}
            {icon === "pie" && <PieChart className={`h-6 w-6 ${getIconColor(icon)}`} />}
            {icon === "line" && <LineChart className={`h-6 w-6 ${getIconColor(icon)}`} />}
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Button 
          className="w-full bg-maintenease-500 hover:bg-maintenease-600"
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
    case "bar": return "bg-blue-100";
    case "pie": return "bg-green-100";
    case "line": return "bg-purple-100";
    default: return "bg-gray-100";
  }
};

const getIconColor = (icon: string): string => {
  switch (icon) {
    case "bar": return "text-blue-700";
    case "pie": return "text-green-700";
    case "line": return "text-purple-700";
    default: return "text-gray-700";
  }
};

export default ReportCard;
