import React from "react";
import {
  Users, Building2, CreditCard, XCircle, Mail, Eye, MapPin, Wrench,
  ClipboardList, Sparkles, UserX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AnalyticsResponse } from "./types";

interface AnalyticsKpisProps {
  data: AnalyticsResponse;
  days: number;
}

export function AnalyticsKpis({ data, days }: AnalyticsKpisProps) {
  const newSignups = data.signupsDaily.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <KpiCard icon={Users} label="Total Users" value={data.totals.total_users} tone="text-blue-600 bg-blue-50" />
      <KpiCard icon={Users} label={`New Signups (${days}d)`} value={newSignups} tone="text-blue-600 bg-blue-50" />
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
      <KpiCard icon={UserX} label="Incomplete Signups" value={data.totals.incomplete_signups} tone="text-rose-600 bg-rose-50" />
    </div>
  );
}

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
