
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

const AnalyticsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          View detailed analytics and reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Work Order Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[180px]">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-100" 
                      strokeWidth="10" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-maintenease-600" 
                      strokeWidth="10" 
                      strokeDasharray="251.2"
                      strokeDashoffset="62.8" 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[180px]">
                <div className="text-center">
                  <p className="text-3xl font-bold">4.2</p>
                  <p className="text-sm text-gray-500">hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[180px]">
                <div className="text-center">
                  <p className="text-3xl font-bold">$12,450</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Work Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border">
              <div className="flex flex-col items-center gap-2">
                <LineChart className="h-12 w-12 text-gray-300" />
                <p className="text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
