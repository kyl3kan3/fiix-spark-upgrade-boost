
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  Calendar, 
  Search,
  Plus,
  Download,
  Play,
  Square,
  Timer
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface DowntimeEvent {
  id: string;
  assetName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  reason: string;
  category: 'planned' | 'unplanned';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cost: number;
  status: 'active' | 'resolved';
}

const DowntimeTrackingContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock downtime events data
  const [downtimeEvents] = useState<DowntimeEvent[]>([
    {
      id: "1",
      assetName: "HVAC Unit #1",
      startTime: new Date(2024, 5, 15, 14, 30),
      endTime: new Date(2024, 5, 15, 18, 45),
      duration: 255, // minutes
      reason: "Compressor failure",
      category: 'unplanned',
      severity: 'high',
      cost: 2500,
      status: 'resolved'
    },
    {
      id: "2", 
      assetName: "Production Line A",
      startTime: new Date(2024, 5, 12, 9, 0),
      endTime: new Date(2024, 5, 12, 11, 30),
      duration: 150,
      reason: "Scheduled maintenance",
      category: 'planned',
      severity: 'medium',
      cost: 800,
      status: 'resolved'
    },
    {
      id: "3",
      assetName: "Elevator #2",
      startTime: new Date(2024, 5, 17, 16, 20),
      reason: "Motor malfunction",
      category: 'unplanned',
      severity: 'critical',
      cost: 0,
      status: 'active'
    }
  ]);

  // Mock analytics data
  const downtimeAnalytics = [
    { month: "Jan", planned: 24, unplanned: 16, cost: 12000 },
    { month: "Feb", planned: 18, unplanned: 22, cost: 15000 },
    { month: "Mar", planned: 20, unplanned: 14, cost: 11000 },
    { month: "Apr", planned: 16, unplanned: 18, cost: 13500 },
    { month: "May", planned: 22, unplanned: 12, cost: 9500 },
    { month: "Jun", planned: 19, unplanned: 15, cost: 11800 },
  ];

  const downtimeByCategory = [
    { name: "Mechanical", value: 35, color: "#3B82F6" },
    { name: "Electrical", value: 28, color: "#10B981" },
    { name: "Software", value: 20, color: "#F59E0B" },
    { name: "Other", value: 17, color: "#EF4444" },
  ];

  const topAssetsDowntime = [
    { asset: "HVAC Unit #1", hours: 24.5, incidents: 8, cost: 15000 },
    { asset: "Production Line A", hours: 18.2, incidents: 6, cost: 12000 },
    { asset: "Elevator #2", hours: 15.8, incidents: 4, cost: 8500 },
    { asset: "Generator #1", hours: 12.3, incidents: 3, cost: 6200 },
    { asset: "Boiler #1", hours: 9.7, incidents: 5, cost: 4800 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalDowntimeHours = downtimeEvents.reduce((acc, event) => {
    return acc + (event.duration ? event.duration / 60 : 0);
  }, 0);

  const totalCost = downtimeEvents.reduce((acc, event) => acc + event.cost, 0);
  const activeIncidents = downtimeEvents.filter(e => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Downtime Tracking
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Monitor and analyze equipment downtime to minimize production losses
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Downtime
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downtime</p>
                    <p className="text-2xl font-bold">{totalDowntimeHours.toFixed(1)}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                    <p className="text-2xl font-bold text-red-600">{activeIncidents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Downtime Cost</p>
                    <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">MTTR</p>
                    <p className="text-2xl font-bold">2.5h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="assets">Top Assets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Downtime Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={downtimeAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="planned" stroke="#3B82F6" name="Planned (hours)" />
                        <Line type="monotone" dataKey="unplanned" stroke="#EF4444" name="Unplanned (hours)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Downtime by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={downtimeByCategory}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {downtimeByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search downtime events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="space-y-4">
                {downtimeEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{event.assetName}</h4>
                            <Badge 
                              variant="outline"
                              className={getSeverityColor(event.severity)}
                            >
                              {event.severity}
                            </Badge>
                            <Badge variant={event.status === 'active' ? 'destructive' : 'secondary'}>
                              {event.status}
                            </Badge>
                            <Badge variant={event.category === 'planned' ? 'default' : 'secondary'}>
                              {event.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.reason}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Started: {format(event.startTime, 'MMM dd, yyyy HH:mm')}</span>
                            {event.endTime && (
                              <span>Ended: {format(event.endTime, 'MMM dd, yyyy HH:mm')}</span>
                            )}
                            {event.duration && (
                              <span>Duration: {Math.floor(event.duration / 60)}h {event.duration % 60}m</span>
                            )}
                            <span>Cost: ${event.cost.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.status === 'active' ? (
                            <Button size="sm" variant="outline">
                              <Square className="h-4 w-4 mr-2" />
                              End Downtime
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cost Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={downtimeAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                      <Bar dataKey="cost" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assets with Most Downtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topAssetsDowntime.map((asset, index) => (
                      <div key={asset.asset} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{asset.asset}</h4>
                            <p className="text-sm text-gray-500">{asset.incidents} incidents</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{asset.hours}h downtime</p>
                          <p className="text-sm text-gray-500">${asset.cost.toLocaleString()} cost</p>
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

export default DowntimeTrackingContent;
