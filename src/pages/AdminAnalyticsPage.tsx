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
  Eye,
  MapPin,
  Wrench,
  ClipboardList,
  Clock,
  Sparkles,
  Globe,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import GoogleAdsPanel from "@/components/admin/GoogleAdsPanel";
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
    total_locations: number;
    total_assets: number;
    total_work_orders: number;
    new_companies_in_range: number;
    incomplete_signups: number;
    incomplete_signups_disposable: number;
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
  visitorsDaily: DailyPoint[];
  companiesCreatedDaily: DailyPoint[];
  uniqueVisitors: number;
  eventBreakdown: { event_type: string; count: number }[];
  topPages: { page_slug: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  trialsEndingSoon: {
    company_id: string;
    company_name: string;
    tier: string;
    trial_ends_at: string;
    days_remaining: number;
  }[];
  recentCompanies: { id: string; name: string; created_at: string }[];
  incompleteSignups: {
    id: string;
    email: string;
    created_at: string;
    age_hours: number;
    disposable: boolean;
  }[];
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
      companies: data.companiesCreatedDaily?.[i]?.count ?? 0,
    }));
  }, [data]);

  const eventsSeries = useMemo(
    () => (data?.eventsDaily ?? []).map((d) => ({ date: fmtDate(d.date), events: d.count })),
    [data],
  );

  const visitorsSeries = useMemo(
    () =>
      (data?.visitorsDaily ?? []).map((d, i) => ({
        date: fmtDate(d.date),
        visitors: d.count,
        pageviews: data?.eventsDaily[i]?.count ?? 0,
      })),
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
              <KpiCard icon={Sparkles} label={`New Cos (${days}d)`} value={data.totals.new_companies_in_range} tone="text-fuchsia-600 bg-fuchsia-50" />
              <KpiCard icon={Eye} label={`Unique Visitors (${days}d)`} value={data.uniqueVisitors} tone="text-cyan-600 bg-cyan-50" />
              <KpiCard icon={CreditCard} label="Active Subs (live)" value={data.totals.live_subscriptions} tone="text-emerald-600 bg-emerald-50" />
              <KpiCard icon={CreditCard} label="Trialing" value={data.totals.trialing_subscriptions} tone="text-amber-600 bg-amber-50" />
              <KpiCard icon={XCircle} label="Canceled" value={data.totals.canceled_subscriptions} tone="text-rose-600 bg-rose-50" />
              <KpiCard icon={XCircle} label="Past Due" value={data.totals.past_due_subscriptions} tone="text-orange-600 bg-orange-50" />
              <KpiCard icon={Mail} label="Marketing Leads" value={data.totals.total_leads} tone="text-violet-600 bg-violet-50" />
              <KpiCard icon={CreditCard} label="All Active+Trial" value={data.totals.active_subscriptions} tone="text-teal-600 bg-teal-50" />
              <KpiCard icon={MapPin} label="Locations" value={data.totals.total_locations} tone="text-lime-600 bg-lime-50" />
              <KpiCard icon={Wrench} label="Assets" value={data.totals.total_assets} tone="text-sky-600 bg-sky-50" />
              <KpiCard icon={ClipboardList} label="Work Orders" value={data.totals.total_work_orders} tone="text-purple-600 bg-purple-50" />
              <KpiCard
                icon={UserX}
                label="Incomplete Signups"
                value={data.totals.incomplete_signups}
                tone="text-rose-600 bg-rose-50"
              />
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
                      <Line type="monotone" dataKey="companies" name="New companies" stroke="#EC4899" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Visitor traffic */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Visitors & Pageviews — Last {days} Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: 280 }}>
                  {visitorsSeries.length === 0 ? (
                    <Empty label="No visitor data in this range" />
                  ) : (
                    <ResponsiveContainer>
                      <LineChart data={visitorsSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="visitors" name="Unique visitors" stroke="#06B6D4" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="pageviews" name="Pageviews/events" stroke="#6366F1" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trials ending + recent companies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Trials Ending in Next 7 Days
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.trialsEndingSoon.length === 0 ? (
                    <div className="p-6"><Empty label="No trials ending in the next 7 days" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Company</th>
                          <th className="px-4 py-2 text-left">Tier</th>
                          <th className="px-4 py-2 text-right">Ends</th>
                          <th className="px-4 py-2 text-right">Days left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.trialsEndingSoon.map((t) => (
                          <tr key={t.company_id + t.trial_ends_at} className="border-t border-border">
                            <td className="px-4 py-2">{t.company_name}</td>
                            <td className="px-4 py-2 capitalize">{t.tier}</td>
                            <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                              {new Date(t.trial_ends_at).toLocaleDateString()}
                            </td>
                            <td className={`px-4 py-2 text-right font-semibold ${t.days_remaining <= 2 ? 'text-rose-600' : 'text-foreground'}`}>
                              {t.days_remaining}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Recently Created Companies ({days}d)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.recentCompanies.length === 0 ? (
                    <div className="p-6"><Empty label="No new companies in this range" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Company</th>
                          <th className="px-4 py-2 text-right">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentCompanies.map((c) => (
                          <tr key={c.id} className="border-t border-border">
                            <td className="px-4 py-2">{c.name}</td>
                            <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Incomplete signups */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserX className="h-4 w-4" /> Incomplete Signups
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    Users who signed up but never created a company
                    {data.totals.incomplete_signups_disposable > 0 && (
                      <> · {data.totals.incomplete_signups_disposable} use disposable email</>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {(data.incompleteSignups ?? []).length === 0 ? (
                  <div className="p-6"><Empty label="No incomplete signups" /></div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Signed up</th>
                        <th className="px-4 py-2 text-right">Age</th>
                        <th className="px-4 py-2 text-center">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.incompleteSignups ?? []).map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="px-4 py-2 font-mono text-xs">{s.email}</td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right text-xs">
                            {s.age_hours < 24
                              ? `${s.age_hours}h`
                              : `${Math.floor(s.age_hours / 24)}d`}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {s.disposable && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <AlertTriangle className="h-3 w-3" /> Disposable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.topReferrers.length === 0 ? (
                    <div className="p-6"><Empty label="No external referrers tracked yet" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Referrer</th>
                          <th className="px-4 py-2 text-right">Visits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topReferrers.map((r) => (
                          <tr key={r.referrer} className="border-t border-border">
                            <td className="px-4 py-2 font-mono text-xs">{r.referrer}</td>
                            <td className="px-4 py-2 text-right font-semibold">{r.count}</td>
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