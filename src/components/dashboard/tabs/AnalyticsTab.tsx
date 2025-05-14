
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  ResponsiveContainer, 
  LineChart as RechartLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart as RechartBarChart,
  Bar,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

// Empty data placeholders
const emptyWorkOrdersData = [
  { month: "Jan", completed: 0, pending: 0, canceled: 0 },
  { month: "Feb", completed: 0, pending: 0, canceled: 0 },
  { month: "Mar", completed: 0, pending: 0, canceled: 0 },
  { month: "Apr", completed: 0, pending: 0, canceled: 0 },
  { month: "May", completed: 0, pending: 0, canceled: 0 },
  { month: "Jun", completed: 0, pending: 0, canceled: 0 },
];

const emptyMaintenanceCostsData = [
  { month: "Jan", planned: 0, unplanned: 0 },
  { month: "Feb", planned: 0, unplanned: 0 },
  { month: "Mar", planned: 0, unplanned: 0 },
  { month: "Apr", planned: 0, unplanned: 0 },
  { month: "May", planned: 0, unplanned: 0 },
  { month: "Jun", planned: 0, unplanned: 0 },
];

const emptyAssetStatusData = [
  { name: "Operational", value: 0, color: "#10B981" },
  { name: "Under Maintenance", value: 0, color: "#F59E0B" },
  { name: "Out of Service", value: 0, color: "#EF4444" },
];

const workCompletionRateConfig = {
  completed: {
    label: "Completed",
    theme: { light: "#10B981", dark: "#10B981" }
  },
};

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
                  <p className="text-3xl font-bold">--</p>
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
                  <p className="text-3xl font-bold">$0</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Work Orders Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>Work Orders Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]" onClick={handleDataNotAvailable}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartLineChart
                  data={emptyWorkOrdersData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    content={(props) => (
                      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md text-xs">
                        <p className="font-medium">{props.payload?.[0]?.payload?.month}</p>
                        {props.payload?.map((entry, index) => (
                          <p key={index} className="flex items-center gap-2">
                            <span 
                              className="block w-2 h-2 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}: {entry.value}</span>
                          </p>
                        ))}
                      </div>
                    )} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" activeDot={{ r: 8 }} strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" activeDot={{ r: 8 }} strokeWidth={2} name="Pending" />
                  <Line type="monotone" dataKey="canceled" stroke="#EF4444" activeDot={{ r: 8 }} strokeWidth={2} name="Canceled" />
                </RechartLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Costs Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Maintenance Costs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]" onClick={handleDataNotAvailable}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={emptyMaintenanceCostsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#3B82F6" name="Planned Maintenance" />
                    <Bar dataKey="unplanned" fill="#EC4899" name="Unplanned Maintenance" />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                <span>Asset Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]" onClick={handleDataNotAvailable}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={emptyAssetStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {emptyAssetStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
