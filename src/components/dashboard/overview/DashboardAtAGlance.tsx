
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pending Tasks</span>
            <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">8</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-maintenease-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium">Team Availability</span>
            <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">75%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium">Asset Health</span>
            <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">92%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/reports")}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Full Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardAtAGlance;
