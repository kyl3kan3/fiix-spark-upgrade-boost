import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AlertTriangle, RefreshCw, Zap, DollarSign, Gauge, ListChecks } from "lucide-react";
import { formatKwh, formatCurrency, type EnergySummary } from "@/lib/energyAnalytics";
import type { EnergyReading } from "@/services/energyService";

interface Props {
  summary: EnergySummary;
  readings: EnergyReading[];
  assetNames: Map<string, string>;
  isLoading: boolean;
  loadError?: Error | null;
  onRetry?: () => void;
}

const KpiCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

const PowerUsageDashboard: React.FC<Props> = ({
  summary,
  readings,
  assetNames,
  isLoading,
  loadError,
  onRetry,
}) => {
  const currency = readings.find((r) => r.cost != null)?.currency ?? "USD";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Couldn't load energy data</h3>
            <p className="text-muted-foreground max-w-md mt-1 text-sm">
              {loadError.message || "Something went wrong while reading your energy data."}
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No energy data yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Log a meter reading or import a CSV of your utility data to start tracking consumption and cost
              over time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const kwhMax = Math.max(1, ...summary.topConsumers.map((c) => c.kwh));
  const recent = readings.slice(0, 10);

  const consumerName = (key: string, label: string) => {
    if (key.startsWith("asset:")) return assetNames.get(key.slice(6)) ?? (label || "Asset");
    if (key.startsWith("meter:")) return label || key.slice(6);
    return "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total consumption" value={formatKwh(summary.totalKwh)} icon={Zap} />
        <KpiCard label="Total cost" value={formatCurrency(summary.totalCost, currency)} icon={DollarSign} />
        <KpiCard
          label="Avg cost / kWh"
          value={summary.avgCostPerKwh > 0 ? formatCurrency(summary.avgCostPerKwh, currency) : "—"}
          icon={Gauge}
        />
        <KpiCard label="Readings" value={summary.count} icon={ListChecks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Consumption over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthly.map((m) => ({ ...m, label: monthLabel(m.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} width={48} className="text-xs" />
                  <Tooltip
                    formatter={(v: number) => formatKwh(v)}
                    cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  />
                  <Bar dataKey="kwh" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top consumers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topConsumers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tagged consumers yet.</p>
            ) : (
              summary.topConsumers.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate pr-2">{consumerName(c.key, c.label)}</span>
                    <span className="font-medium whitespace-nowrap">{formatKwh(c.kwh)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(c.kwh / kwhMax) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent readings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset / meter</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">kWh</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(r.reading_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {r.asset_id ? assetNames.get(r.asset_id) ?? "—" : r.meter_label || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatKwh(r.kwh)}</TableCell>
                  <TableCell className="text-right">
                    {r.cost != null ? formatCurrency(r.cost, r.currency) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PowerUsageDashboard;
