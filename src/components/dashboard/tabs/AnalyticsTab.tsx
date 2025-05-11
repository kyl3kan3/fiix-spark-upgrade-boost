
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

// Sample data for charts
const workOrdersData = [
  { month: "Jan", completed: 45, pending: 28, canceled: 5 },
  { month: "Feb", completed: 52, pending: 23, canceled: 3 },
  { month: "Mar", completed: 48, pending: 25, canceled: 7 },
  { month: "Apr", completed: 61, pending: 19, canceled: 4 },
  { month: "May", completed: 55, pending: 21, canceled: 2 },
  { month: "Jun", completed: 67, pending: 15, canceled: 3 },
];

const maintenanceCostsData = [
  { month: "Jan", planned: 5800, unplanned: 3200 },
  { month: "Feb", planned: 6100, unplanned: 2700 },
  { month: "Mar", planned: 5900, unplanned: 4100 },
  { month: "Apr", planned: 6300, unplanned: 2300 },
  { month: "May", planned: 6700, unplanned: 1900 },
  { month: "Jun", planned: 7200, unplanned: 1500 },
];

const assetStatusData = [
  { name: "Operational", value: 75, color: "#10B981" },
  { name: "Under Maintenance", value: 15, color: "#F59E0B" },
  { name: "Out of Service", value: 10, color: "#EF4444" },
];

const workCompletionRateConfig = {
  completed: {
    label: "Completed",
    theme: { light: "#10B981", dark: "#10B981" }
  },
};

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
        
        {/* Work Orders Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>Work Orders Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartLineChart
                  data={workOrdersData}
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
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={maintenanceCostsData}
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
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={assetStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {assetStatusData.map((entry, index) => (
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
