import { useMemo } from "react";
import {
  Building2, Clock, UserX, AlertTriangle, MousePointerClick, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Empty } from "./Empty";
import { TIER_COLORS, fmtDate } from "./types";
import type { AnalyticsResponse } from "./types";

interface AnalyticsTablesProps {
  data: AnalyticsResponse;
  days: number;
}

export function AnalyticsTables({ data, days }: AnalyticsTablesProps) {
  const eventsSeries = useMemo(
    () => (data.eventsDaily ?? []).map((d) => ({ date: fmtDate(d.date), events: d.count })),
    [data],
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Trials Ending in Next 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {data.trialsEndingSoon.length === 0 ? (
              <div className="p-6"><Empty label="No trials ending in the next 7 days" /></div>
            ) : (
              <table className="w-full min-w-[480px] text-sm">
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
                      <td className={`px-4 py-2 text-right font-semibold ${t.days_remaining <= 2 ? 'text-destructive' : 'text-foreground'}`}>
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
          <CardContent className="p-0 overflow-x-auto">
            {data.recentCompanies.length === 0 ? (
              <div className="p-6"><Empty label="No new companies in this range" /></div>
            ) : (
              <table className="w-full min-w-[360px] text-sm">
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
        <CardContent className="p-0 overflow-x-auto">
          {(data.incompleteSignups ?? []).length === 0 ? (
            <div className="p-6"><Empty label="No incomplete signups" /></div>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
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
                      {s.age_hours < 24 ? `${s.age_hours}h` : `${Math.floor(s.age_hours / 24)}d`}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {s.disposable && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
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
          <CardContent className="p-0 overflow-x-auto">
            {data.eventBreakdown.length === 0 ? (
              <div className="p-6"><Empty label="No events tracked yet" /></div>
            ) : (
              <table className="w-full min-w-[360px] text-sm">
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
          <CardContent className="p-0 overflow-x-auto">
            {data.topPages.length === 0 ? (
              <div className="p-6"><Empty label="No page views tracked yet" /></div>
            ) : (
              <table className="w-full min-w-[360px] text-sm">
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
          <CardContent className="p-0 overflow-x-auto">
            {data.topReferrers.length === 0 ? (
              <div className="p-6"><Empty label="No external referrers tracked yet" /></div>
            ) : (
              <table className="w-full min-w-[360px] text-sm">
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
  );
}
