
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardMetricCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  buttonColor: string;
  navigateTo: string;
  animationDelay?: string;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  buttonColor,
  navigateTo,
  animationDelay
}) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover-scale animate-entry" 
      style={{ animationDelay }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-5 w-5 text-${iconColor}-500`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className={`bg-${iconColor}-100 dark:bg-${iconColor}-900/30 p-3 rounded-full`}>
            <Icon className={`h-6 w-6 text-${iconColor}-600 dark:text-${iconColor}-400`} />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(navigateTo)}
            className={`font-medium border-${buttonColor}-200 hover:border-${buttonColor}-300 hover:bg-${buttonColor}-50 dark:border-${buttonColor}-800 dark:hover:border-${buttonColor}-700 dark:hover:bg-${buttonColor}-900/20`}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;
