
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Wrench, 
  AlertTriangle,
  Download,
  Calendar
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const PerformanceAnalyticsContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Mock data for analytics
  const kpiData = [
    { name: "MTTR", value: "2.5h", change: "-12%", trend: "down", color: "text-green-600" },
    { name: "MTBF", value: "45d", change: "+8%", trend: "up", color: "text-green-600" },
    { name: "Uptime", value: "98.5%", change: "+2%", trend: "up", color: "text-green-600" },
    { name: "Cost per Hour", value: "$125", change: "-5%", trend: "down", color: "text-green-600" },
  ];

  const performanceData = [
    { month: "Jan", uptime: 97.2, mttr: 3.1, cost: 15420 },
    { month: "Feb", uptime: 98.1, mttr: 2.8, cost: 14890 },
    { month: "Mar", uptime: 97.8, mttr: 2.9, cost: 15100 },
    { month: "Apr", uptime: 98.5, mttr: 2.5, cost: 14200 },
    { month: "May", uptime: 98.9, mttr: 2.3, cost: 13800 },
    { month: "Jun", uptime: 98.5, mttr: 2.5, cost: 14100 },
  ];

  const assetEfficiencyData = [
    { name: "HVAC Systems", efficiency: 92, issues: 3 },
    { name: "Electrical", efficiency: 87, issues: 7 },
    { name: "Plumbing", efficiency: 95, issues: 1 },
    { name: "Elevators", efficiency: 89, issues: 4 },
    { name: "Lighting", efficiency: 98, issues: 0 },
  ];

  const costBredownData = [
    { name: "Labor", value: 45, color: "#3B82F6" },
    { name: "Parts", value: 30, color: "#10B981" },
    { name: "External Services", value: 15, color: "#F59E0B" },
    { name: "Other", value: 10, color: "#EF4444" },
  ];

  const maintenanceTypeData = [
    { type: "Preventive", completed: 85, scheduled: 92, efficiency: 92.4 },
    { type: "Corrective", completed: 67, scheduled: 78, efficiency: 85.9 },
    { type: "Emergency", completed: 23, scheduled: 23, efficiency: 100 },
    { type: "Predictive", completed: 12, scheduled: 15, efficiency: 80.0 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Monitor and analyze your maintenance performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiData.map((kpi) => (
              <Card key={kpi.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${kpi.color}`} />
                      <span className={`text-sm font-medium ${kpi.color}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="efficiency">Asset Efficiency</TabsTrigger>
              <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Types</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="uptime" stroke="#3B82F6" name="Uptime %" />
                        <Line yAxisId="right" type="monotone" dataKey="mttr" stroke="#EF4444" name="MTTR (hours)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                        <Bar dataKey="cost" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="efficiency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Efficiency by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assetEfficiencyData.map((asset) => (
                      <div key={asset.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-500">{asset.issues} open issues</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${asset.efficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12">{asset.efficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="costs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costBredownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {costBredownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Total Monthly Cost</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">$14,100</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Cost Savings</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">$1,320</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Cost per Hour</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">$125</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Type Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceTypeData.map((type) => (
                      <div key={type.type} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{type.type} Maintenance</h4>
                          <Badge variant={type.efficiency >= 90 ? "default" : type.efficiency >= 80 ? "secondary" : "destructive"}>
                            {type.efficiency}% efficiency
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="font-medium">{type.completed}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Scheduled</p>
                            <p className="font-medium">{type.scheduled}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completion Rate</p>
                            <p className="font-medium">{Math.round((type.completed / type.scheduled) * 100)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalyticsContent;
