
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardAtAGlance: React.FC = () => {
  // Only call useNavigate when the component is mounted
  // This prevents router issues during SSR or testing
  const navigate = useNavigate();
  
  const handleViewReportsClick = () => {
    navigate("/reports");
  };
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm animate-entry mb-4" style={{ animationDelay: "250ms" }}>
      <CardHeader className="p-3 md:p-4">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-maintenease-500" />
          At a Glance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <div className="text-center py-4 md:py-6 text-gray-500 dark:text-gray-400 text-sm">
          No statistics available yet
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={handleViewReportsClick}
          >
            <FileText className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            View Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardAtAGlance;
