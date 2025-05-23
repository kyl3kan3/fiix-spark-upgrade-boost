
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardAtAGlance: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm animate-entry" style={{ animationDelay: "250ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-maintenease-500" />
          At a Glance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No statistics available yet
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/reports")}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardAtAGlance;
