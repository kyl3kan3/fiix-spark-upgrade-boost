import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AlertTriangle, RefreshCw, DollarSign, ShieldCheck, Wrench, ReceiptText } from "lucide-react";
import {
  formatCurrency,
  COST_CATEGORIES,
  type CostCategory,
  type CostSummary,
} from "@/lib/costAnalytics";
import type { MaintenanceCost } from "@/services/costTrackingService";

interface Props {
  summary: CostSummary;
  costs: MaintenanceCost[];
  assetNames: Map<string, string>;
  isLoading: boolean;
  loadError?: Error | null;
  onRetry?: () => void;
}

const CATEGORY_LABELS: Record<CostCategory, string> = {
  labor: "Labor",
  parts: "Parts",
  contractor: "Contractor",
  downtime: "Downtime",
  other: "Other",
};

const TYPE_STYLES: Record<string, string> = {
  preventive: "bg-success/15 text-success border-success/30",
  reactive: "bg-warning/15 text-warning border-warning/30",
  other: "bg-muted text-muted-foreground",
};

const KpiCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${accent ?? ""}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${accent ?? "text-muted-foreground"}`} />
      </div>
    </CardContent>
  </Card>
);

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

const CostTrackingDashboard: React.FC<Props> = ({
  summary,
  costs,
  assetNames,
  isLoading,
  loadError,
  onRetry,
}) => {
  const currency = costs[0]?.currency ?? "USD";

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
            <h3 className="text-lg font-semibold">Couldn't load cost data</h3>
            <p className="text-muted-foreground max-w-md mt-1 text-sm">
              {loadError.message || "Something went wrong while reading your maintenance costs."}
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

  if (costs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No costs logged yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Log maintenance spend — labor, parts, contractors, downtime — and tag each entry preventive or
              reactive to see where your money goes and where you're saving.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const preventivePct = Math.round(summary.preventiveRatio * 100);
  const categoryMax = Math.max(1, ...COST_CATEGORIES.map((c) => summary.byCategory[c]));
  const recent = costs.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total spend" value={formatCurrency(summary.total, currency)} icon={DollarSign} />
        <KpiCard
          label="Preventive share"
          value={`${preventivePct}%`}
          icon={ShieldCheck}
          accent={preventivePct >= 50 ? "text-success" : undefined}
        />
        <KpiCard
          label="Reactive spend"
          value={formatCurrency(summary.byType.reactive, currency)}
          icon={Wrench}
          accent={summary.byType.reactive > summary.byType.preventive ? "text-warning" : undefined}
        />
        <KpiCard label="Entries" value={summary.count} icon={ReceiptText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Spend over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthly.map((m) => ({ ...m, label: monthLabel(m.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} width={48} className="text-xs" />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v, currency)}
                    cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {COST_CATEGORIES.map((c) => (
              <div key={c}>
                <div className="flex justify-between text-sm">
                  <span>{CATEGORY_LABELS[c]}</span>
                  <span className="font-medium">{formatCurrency(summary.byCategory[c], currency)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(summary.byCategory[c] / categoryMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(c.incurred_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{c.asset_id ? assetNames.get(c.asset_id) ?? "—" : "—"}</TableCell>
                  <TableCell className="capitalize">{CATEGORY_LABELS[c.category]}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TYPE_STYLES[c.maintenance_type] ?? ""}>
                      <span className="capitalize">{c.maintenance_type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(c.amount, c.currency)}
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

export default CostTrackingDashboard;
