
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import MetricCard from "./analytics/MetricCard";
import WorkOrdersLineChart from "./analytics/WorkOrdersLineChart";
import MaintenanceCostsBarChart from "./analytics/MaintenanceCostsBarChart";
import AssetStatusPieChart from "./analytics/AssetStatusPieChart";
import { 
  emptyWorkOrdersData,
  emptyMaintenanceCostsData,
  emptyAssetStatusData
} from "./analytics/analyticsData";

const AnalyticsTab: React.FC = () => {
  const handleDataNotAvailable = () => {
    toast.info("Analytics data will be available once connected to your database.");
  };

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
          <MetricCard title="Work Order Completion Rate">
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
                  className="text-gray-300" 
                  strokeWidth="10" 
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2" 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <span className="absolute text-2xl font-bold">0%</span>
            </div>
          </MetricCard>
          
          <MetricCard title="Average Response Time">
            <div className="text-center">
              <p className="text-3xl font-bold">--</p>
              <p className="text-sm text-gray-500">hours</p>
            </div>
          </MetricCard>
          
          <MetricCard title="Maintenance Costs">
            <div className="text-center">
              <p className="text-3xl font-bold">$0</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </MetricCard>
        </div>
        
        {/* Work Orders Over Time Chart */}
        <WorkOrdersLineChart 
          data={emptyWorkOrdersData} 
          onDataNotAvailable={handleDataNotAvailable}
        />
        
        {/* Additional charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Costs Chart */}
          <MaintenanceCostsBarChart
            data={emptyMaintenanceCostsData}
            onDataNotAvailable={handleDataNotAvailable}
          />

          {/* Asset Status Chart */}
          <AssetStatusPieChart
            data={emptyAssetStatusData}
            onDataNotAvailable={handleDataNotAvailable}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
