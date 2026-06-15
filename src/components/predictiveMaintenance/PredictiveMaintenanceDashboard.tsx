import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Gauge,
  CalendarClock,
  BrainCircuit,
  Sparkles,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import type { AssetRiskScore } from "@/services/predictiveMaintenanceService";
import type { PredictiveMaintenanceStats } from "@/hooks/usePredictiveMaintenance";
import type { RiskFactor, RiskLevel } from "@/lib/predictiveScoring";

interface Props {
  scores: AssetRiskScore[];
  stats: PredictiveMaintenanceStats;
  isLoading: boolean;
  onRecompute: () => void;
  isRecomputing: boolean;
  loadError?: Error | null;
  recomputeError?: Error | null;
  onRetryLoad?: () => void;
}

const RISK_STYLES: Record<RiskLevel, { label: string; className: string; fill: string }> = {
  low: { label: "Low", className: "bg-success/15 text-success border-success/30", fill: "hsl(var(--success))" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning border-warning/30", fill: "hsl(var(--warning))" },
  high: { label: "High", className: "bg-warning/25 text-warning border-warning/40", fill: "hsl(var(--warning))" },
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive border-destructive/30", fill: "hsl(var(--destructive))" },
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const style = RISK_STYLES[level];
  return (
    <Badge variant="outline" className={style.className}>
      {style.label}
    </Badge>
  );
}

function topFactor(factors: RiskFactor[]): RiskFactor | null {
  if (!factors || factors.length === 0) return null;
  return [...factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatRul(days: number | null): string {
  if (days === null) return "—";
  if (days <= 0) return "Overdue";
  if (days < 60) return `${days} days`;
  return `${Math.round(days / 30)} months`;
}

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

const PredictiveMaintenanceDashboard: React.FC<Props> = ({
  scores,
  stats,
  isLoading,
  onRecompute,
  isRecomputing,
  loadError,
  recomputeError,
  onRetryLoad,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

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
            <h3 className="text-lg font-semibold">Couldn't load risk scores</h3>
            <p className="text-muted-foreground max-w-md mt-1 text-sm">
              {loadError.message || "Something went wrong while reading the latest analysis."}
            </p>
          </div>
          <div className="flex gap-2">
            {onRetryLoad && (
              <Button variant="outline" onClick={onRetryLoad}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button onClick={onRecompute} disabled={isRecomputing}>
              <Sparkles className="h-4 w-4 mr-2" />
              {isRecomputing ? "Analyzing…" : "Run analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No risk scores yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Run the model to analyze your equipment's age, failure history, open work orders, and
              recorded condition readings, and surface which assets are most likely to fail.
            </p>
            {recomputeError && (
              <p className="text-sm text-destructive mt-3">
                Last attempt failed: {recomputeError.message}
              </p>
            )}
          </div>
          <Button onClick={onRecompute} disabled={isRecomputing}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isRecomputing ? "Analyzing…" : "Run analysis"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const distribution = (["low", "medium", "high", "critical"] as RiskLevel[]).map((level) => ({
    level: RISK_STYLES[level].label,
    count: stats[level],
    fill: RISK_STYLES[level].fill,
  }));

  return (
    <div className="space-y-6">
      {recomputeError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Last recompute failed</p>
              <p className="text-sm text-muted-foreground">{recomputeError.message}</p>
            </div>
            <Button size="sm" variant="outline" onClick={onRecompute} disabled={isRecomputing}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Critical assets"
          value={stats.critical}
          icon={AlertTriangle}
          accent={stats.critical > 0 ? "text-destructive" : undefined}
        />
        <KpiCard
          label="High risk"
          value={stats.high}
          icon={AlertTriangle}
          accent={stats.high > 0 ? "text-warning" : undefined}
        />
        <KpiCard label="Average risk" value={stats.averageRisk} icon={Gauge} />
        <KpiCard
          label="Likely failures · 30d"
          value={stats.failuresNext30Days}
          icon={CalendarClock}
          accent={stats.failuresNext30Days > 0 ? "text-destructive" : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
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
          <CardTitle className="text-base">Asset risk ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Predicted failure</TableHead>
                  <TableHead>Remaining life</TableHead>
                  <TableHead>Top driver</TableHead>
                  <TableHead className="min-w-[260px]">Recommended action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score) => {
                  const driver = topFactor(score.contributing_factors);
                  const isOpen = expanded.has(score.id);
                  return (
                    <React.Fragment key={score.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggle(score.id)}
                    >
                      <TableCell className="w-8">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {score.asset?.name ?? "Unknown asset"}
                        {score.asset?.location && (
                          <span className="block text-xs text-muted-foreground">{score.asset.location}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {score.risk_score.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={score.risk_level} />
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(score.predicted_failure_date)}</TableCell>
                      <TableCell className="text-sm">{formatRul(score.remaining_useful_life_days)}</TableCell>
                      <TableCell className="text-sm">
                        {driver ? (
                          <span title={driver.detail}>{driver.label}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{score.recommended_action ?? "—"}</TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <ScoreExplanation score={score} />
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Powered by an explainable heuristic model ({scores[0]?.model_version ?? "heuristic-v1"}) over your
        live asset, work-order and condition data. Scores update each time you recompute and on the
        scheduled 6-hour cadence.
      </p>
    </div>
  );
};

export default PredictiveMaintenanceDashboard;

function ScoreExplanation({ score }: { score: AssetRiskScore }) {
  const factors = score.contributing_factors ?? [];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-semibold">Why this score?</h4>
        <p className="text-xs text-muted-foreground">
          Composite score: <span className="font-medium">{score.risk_score.toFixed(1)}</span> · failure
          probability: <span className="font-medium">{Math.round(score.failure_probability * 100)}%</span>
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {factors.map((f: RiskFactor) => {
          const contribution = Math.round(f.score * f.weight * 10) / 10;
          return (
            <div key={f.key} className="space-y-1.5 p-3 rounded-md border bg-background">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(f.score)} × {Math.round(f.weight * 100)}% = +{contribution}
                </span>
              </div>
              <Progress value={f.score} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{f.detail}</p>
            </div>
          );
        })}
      </div>
      {score.computed_at && (
        <p className="text-xs text-muted-foreground">
          Computed {new Date(score.computed_at).toLocaleString()} · model {score.model_version}
        </p>
      )}
    </div>
  );
}
