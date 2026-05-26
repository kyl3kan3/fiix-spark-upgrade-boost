import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Users,
  Building2,
  CreditCard,
  XCircle,
  Mail,
  MousePointerClick,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DailyPoint = { date: string; count: number };

interface AnalyticsResponse {
  days: number;
  totals: {
    total_users: number;
    total_companies: number;
    total_leads: number;
    active_subscriptions: number;
    live_subscriptions: number;
    trialing_subscriptions: number;
    canceled_subscriptions: number;
    past_due_subscriptions: number;
  };
  byTier: { tier: string; count: number }[];
  signupsDaily: DailyPoint[];
  subsCreatedDaily: DailyPoint[];
  trialsStartedDaily: DailyPoint[];
  cancelsDaily: DailyPoint[];
  leadsDaily: DailyPoint[];
  eventsDaily: DailyPoint[];
  eventBreakdown: { event_type: string; count: number }[];
  topPages: { page_slug: string; count: number }[];
  generatedAt: string;
}

const TIER_COLORS: Record<string, string> = {
  starter: "#3B82F6",
  pro: "#8B5CF6",
  business: "#10B981",
};

const RANGE_OPTIONS = [7, 14, 30, 60, 90];

const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setIsSuperAdmin(false); return; }
      const { data, error } = await supabase.rpc("is_super_admin", { _user_id: user.id });
      if (!cancelled) setIsSuperAdmin(!error && data === true);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const load = async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
        body: {},
        method: "GET",
        // @ts-expect-error supabase-js v2 supports query through invoke options
        query: { days: String(range) },
      });
      if (fnErr) throw fnErr;
      setData(res as AnalyticsResponse);
    } catch (e) {
      // Fallback: use fetch with query param
      try {
        const session = (await supabase.auth.getSession()).data.session;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/admin-analytics?days=${range}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message ?? "Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, isSuperAdmin]);

  const fmtDate = (s: string) => s.slice(5);

  const combinedActivity = useMemo(() => {
    if (!data) return [];
    return data.signupsDaily.map((s, i) => ({
      date: fmtDate(s.date),
      signups: s.count,
      purchases: data.subsCreatedDaily[i]?.count ?? 0,
      trialsStarted: data.trialsStartedDaily?.[i]?.count ?? 0,
      cancels: data.cancelsDaily[i]?.count ?? 0,
      leads: data.leadsDaily[i]?.count ?? 0,
    }));
  }, [data]);

  const eventsSeries = useMemo(
    () => (data?.eventsDaily ?? []).map((d) => ({ date: fmtDate(d.date), events: d.count })),
    [data],
  );

  if (isSuperAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Super admin access required</h1>
          <p className="text-muted-foreground mb-6">
            Only the platform super admin can view site analytics.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin Analytics | MaintenEase</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Signups, subscriptions, marketing engagement across MaintenEase.
              {data && (
                <span className="ml-2">
                  Updated {new Date(data.generatedAt).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-border overflow-hidden">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setDays(r)}
                  className={`px-3 py-1.5 text-sm transition ${
                    days === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => load(days)} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <KpiCard icon={Users} label="Total Users" value={data.totals.total_users} tone="text-blue-600 bg-blue-50" />
              <KpiCard icon={Building2} label="Companies" value={data.totals.total_companies} tone="text-indigo-600 bg-indigo-50" />
              <KpiCard icon={CreditCard} label="Active Subs (live)" value={data.totals.live_subscriptions} tone="text-emerald-600 bg-emerald-50" />
              <KpiCard icon={CreditCard} label="Trialing" value={data.totals.trialing_subscriptions} tone="text-amber-600 bg-amber-50" />
              <KpiCard icon={XCircle} label="Canceled" value={data.totals.canceled_subscriptions} tone="text-rose-600 bg-rose-50" />
              <KpiCard icon={XCircle} label="Past Due" value={data.totals.past_due_subscriptions} tone="text-orange-600 bg-orange-50" />
              <KpiCard icon={Mail} label="Marketing Leads" value={data.totals.total_leads} tone="text-violet-600 bg-violet-50" />
              <KpiCard icon={CreditCard} label="All Active+Trial" value={data.totals.active_subscriptions} tone="text-teal-600 bg-teal-50" />
            </div>

            {/* Activity over time */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">User Activity — Last {days} Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={combinedActivity} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="signups" name="Signups" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="purchases" name="New subscriptions" stroke="#10B981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="trialsStarted" name="Trials started" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cancels" name="Cancellations" stroke="#EF4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="leads" name="Leads" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Two-column row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Marketing Page Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ width: "100%", height: 260 }}>
                    {eventsSeries.length === 0 ? (
                      <Empty label="No tracked page events in this range" />
                    ) : (
                      <ResponsiveContainer>
                        <BarChart data={eventsSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="events" name="Events" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subscriptions by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ width: "100%", height: 260 }}>
                    {data.byTier.length === 0 ? (
                      <Empty label="No active subscriptions" />
                    ) : (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={data.byTier}
                            dataKey="count"
                            nameKey="tier"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            label={({ tier, count }) => `${tier}: ${count}`}
                          >
                            {data.byTier.map((d) => (
                              <Cell key={d.tier} fill={TIER_COLORS[d.tier] ?? "#9CA3AF"} />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Event Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.eventBreakdown.length === 0 ? (
                    <div className="p-6"><Empty label="No events tracked yet" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Event</th>
                          <th className="px-4 py-2 text-right">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.eventBreakdown.map((e) => (
                          <tr key={e.event_type} className="border-t border-border">
                            <td className="px-4 py-2 font-mono text-xs">{e.event_type}</td>
                            <td className="px-4 py-2 text-right font-semibold">{e.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Pages (Views)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.topPages.length === 0 ? (
                    <div className="p-6"><Empty label="No page views tracked yet" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Page</th>
                          <th className="px-4 py-2 text-right">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topPages.map((p) => (
                          <tr key={p.page_slug} className="border-t border-border">
                            <td className="px-4 py-2 font-mono text-xs">{p.page_slug}</td>
                            <td className="px-4 py-2 text-right font-semibold">{p.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Card className="p-4">
      <div className={`inline-flex p-2 rounded-lg ${tone} mb-3`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold leading-tight">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export default AdminAnalyticsPage;