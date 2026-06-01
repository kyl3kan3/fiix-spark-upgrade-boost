import { useMemo } from "react";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Empty } from "./Empty";
import { fmtDate } from "./types";
import type { AnalyticsResponse } from "./types";

interface AnalyticsChartsProps {
  data: AnalyticsResponse;
  days: number;
}

export function AnalyticsCharts({ data, days }: AnalyticsChartsProps) {
  const combinedActivity = useMemo(
    () =>
      data.signupsDaily.map((s, i) => ({
        date: fmtDate(s.date),
        signups: s.count,
        purchases: data.subsCreatedDaily[i]?.count ?? 0,
        trialsStarted: data.trialsStartedDaily?.[i]?.count ?? 0,
        cancels: data.cancelsDaily[i]?.count ?? 0,
        leads: data.leadsDaily[i]?.count ?? 0,
        companies: data.companiesCreatedDaily?.[i]?.count ?? 0,
      })),
    [data],
  );

  const visitorsSeries = useMemo(
    () =>
      (data.visitorsDaily ?? []).map((d, i) => ({
        date: fmtDate(d.date),
        visitors: d.count,
        pageviews: data.eventsDaily[i]?.count ?? 0,
      })),
    [data],
  );

  return (
    <>
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
    </>
  );
}
