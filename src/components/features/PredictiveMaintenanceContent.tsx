import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  AlertTriangle,
  Gauge,
  CalendarClock,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
} from "recharts";

const PredictiveMaintenanceContent: React.FC = () => {
  // Mock data illustrating the real in-app model's output.
  const kpiData = [
    { name: "Critical assets", value: "3", icon: AlertTriangle, accent: "text-destructive" },
    { name: "Avg risk score", value: "42.6", icon: Gauge, accent: "text-foreground" },
    { name: "Predicted failures (30d)", value: "5", icon: CalendarClock, accent: "text-warning" },
    { name: "Downtime avoided", value: "62h", icon: TrendingDown, accent: "text-success" },
  ];

  const riskedAssets = [
    { asset: "Compressor #2", score: 91, level: "Critical", driver: "Failure history", action: "Schedule emergency maintenance" },
    { asset: "Rooftop HVAC-3", score: 78, level: "High", driver: "Condition signals", action: "Inspect within 2 weeks" },
    { asset: "Conveyor Line B", score: 64, level: "High", driver: "Open work orders", action: "Inspect within 2 weeks" },
    { asset: "Boiler #1", score: 47, level: "Medium", driver: "Age & wear", action: "Plan PM this quarter" },
    { asset: "Pump Station 4", score: 22, level: "Low", driver: "Age & wear", action: "Routine monitoring" },
  ];

  const distribution = [
    { level: "Low", count: 18, fill: "hsl(var(--success))" },
    { level: "Medium", count: 9, fill: "hsl(var(--warning))" },
    { level: "High", count: 4, fill: "hsl(var(--warning))" },
    { level: "Critical", count: 3, fill: "hsl(var(--destructive))" },
  ];

  const forecastData = [
    { month: "Jan", predicted: 6, actual: 5 },
    { month: "Feb", predicted: 5, actual: 6 },
    { month: "Mar", predicted: 7, actual: 6 },
    { month: "Apr", predicted: 4, actual: 4 },
    { month: "May", predicted: 5, actual: 5 },
    { month: "Jun", predicted: 5, actual: null },
  ];

  const levelVariant = (level: string) =>
    level === "Critical" ? "destructive" : level === "Low" ? "secondary" : "default";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Predictive Maintenance
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Risk scores computed from asset age, failure history, open work and condition data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Recompute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiData.map((kpi) => (
              <Card key={kpi.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
                      <p className={`text-2xl font-bold ${kpi.accent}`}>{kpi.value}</p>
                    </div>
                    <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Risk Overview</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs sm:text-sm">Failure Forecast</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs sm:text-sm">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Risk distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="level" />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {distribution.map((d) => (
                            <Cell key={d.level} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Highest-risk assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskedAssets.map((a) => (
                        <div key={a.asset} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{a.asset}</p>
                            <p className="text-xs text-muted-foreground">Driver: {a.driver}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-semibold tabular-nums w-8 text-right">{a.score}</span>
                            <Badge variant={levelVariant(a.level)}>{a.level}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Predicted vs actual failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" name="Predicted" strokeWidth={2} />
                      <Line type="monotone" dataKey="actual" stroke="hsl(var(--destructive))" name="Actual" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Prioritized actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskedAssets.map((a) => (
                      <div key={a.asset} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <h4 className="font-medium">{a.asset}</h4>
                          <Badge variant={levelVariant(a.level)}>{a.level} · {a.score}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {a.action}. Top driver: {a.driver.toLowerCase()}.
                        </p>
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

export default PredictiveMaintenanceContent;
