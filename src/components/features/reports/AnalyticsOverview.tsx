import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";

type WO = {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  due_date: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  in_progress: "#3B82F6",
  completed: "#10B981",
  cancelled: "#9CA3AF",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AnalyticsOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WO[]>([]);
  const [assetCount, setAssetCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [wo, assets, team] = await Promise.all([
          supabase.from("work_orders").select("id,status,priority,created_at,due_date"),
          supabase.from("assets").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);
        if (cancelled) return;
        setWorkOrders((wo.data as WO[]) ?? []);
        setAssetCount(assets.count ?? 0);
        setTeamCount(team.count ?? 0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = workOrders.length;
    const open = workOrders.filter((w) => w.status === "pending" || w.status === "in_progress").length;
    const completed = workOrders.filter((w) => w.status === "completed").length;
    const overdue = workOrders.filter(
      (w) =>
        w.due_date &&
        new Date(w.due_date) < new Date() &&
        w.status !== "completed" &&
        w.status !== "cancelled",
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, open, completed, overdue, completionRate };
  }, [workOrders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((w) => {
      counts[w.status] = (counts[w.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
      key: name,
    }));
  }, [workOrders]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets: { name: string; created: number; completed: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        name: MONTHS[d.getMonth()],
        created: 0,
        completed: 0,
        key: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    const idxFor = (date: Date) => {
      const k = `${date.getFullYear()}-${date.getMonth()}`;
      return buckets.findIndex((b) => b.key === k);
    };
    workOrders.forEach((w) => {
      const ci = idxFor(new Date(w.created_at));
      if (ci >= 0) buckets[ci].created++;
      if (w.status === "completed") {
        const di = idxFor(new Date(w.created_at));
        if (di >= 0) buckets[di].completed++;
      }
    });
    return buckets;
  }, [workOrders]);

  const priorityData = useMemo(() => {
    const order = ["urgent", "high", "medium", "low"];
    const counts: Record<string, number> = {};
    workOrders.forEach((w) => {
      counts[w.priority] = (counts[w.priority] ?? 0) + 1;
    });
    return order
      .filter((p) => counts[p])
      .map((p) => ({ name: p, value: counts[p] }));
  }, [workOrders]);

  if (loading) {
    return (
      <Card className="h-48 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const kpis = [
    { label: "Total Work Orders", value: stats.total, icon: ClipboardList, tone: "text-blue-600 bg-blue-50" },
    { label: "Open", value: stats.open, icon: Activity, tone: "text-amber-600 bg-amber-50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, tone: "text-violet-600 bg-violet-50" },
    { label: "Assets Tracked", value: assetCount, icon: Package, tone: "text-teal-600 bg-teal-50" },
    { label: "Team Members", value: teamCount, icon: Users, tone: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${k.tone} mb-3`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold leading-tight">{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Work Orders — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" name="Created" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              {statusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No work orders yet
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((d) => (
                        <Cell key={d.key} fill={STATUS_COLORS[d.key] ?? "#9CA3AF"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 220 }}>
            {priorityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No work orders yet
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 16, left: 16, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" name="Work Orders" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;