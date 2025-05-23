
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, FileText, CheckSquare } from "lucide-react";

const DashboardActivityCard: React.FC = () => {
  return (
    <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm animate-entry" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-maintenease-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Activity items would go here */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">New work order created</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today, 10:30 AM</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Inspection completed</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday, 3:45 PM</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardActivityCard;
