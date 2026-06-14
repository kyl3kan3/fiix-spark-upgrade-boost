import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, User, Bot, AlertTriangle } from "lucide-react";
import type { RiskScoreRun } from "@/hooks/usePredictiveMaintenance";

interface Props {
  runs: RiskScoreRun[];
  isLoading: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function summaryText(run: RiskScoreRun): string {
  if (run.status === "failed") return run.error_message ?? "Run failed";
  if (run.status === "empty") return "No assets to score";
  const s = run.summary as Record<string, number>;
  const parts: string[] = [];
  if (typeof s.total === "number") parts.push(`${s.total} asset${s.total === 1 ? "" : "s"}`);
  if (typeof s.critical === "number" && s.critical > 0) parts.push(`${s.critical} critical`);
  if (typeof s.high === "number" && s.high > 0) parts.push(`${s.high} high`);
  if (typeof s.avg_score === "number") parts.push(`avg ${s.avg_score}`);
  return parts.join(" · ");
}

function snapshotText(run: RiskScoreRun): string {
  const sn = run.snapshot;
  return `${sn.assets ?? 0} assets · ${sn.work_orders ?? 0} WOs · ${sn.failure_events ?? 0} failures · ${sn.health_metrics ?? 0} readings`;
}

const RiskScoreRunsHistory: React.FC<Props> = ({ runs, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Analysis history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No runs yet. Manual recomputes and scheduled runs (every 6 hours) will appear here.
          </p>
        ) : (
          <ul className="divide-y">
            {runs.map((run) => (
              <li key={run.id} className="py-3 flex items-start gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-[160px]">
                  {run.triggered_by === "scheduled" ? (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {run.triggered_by === "scheduled" ? "Scheduled" : run.actor_name ?? "Manual"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(run.created_at)}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm">{summaryText(run)}</p>
                  <p className="text-xs text-muted-foreground">
                    Snapshot: {snapshotText(run)}
                    {run.duration_ms != null && ` · ${run.duration_ms}ms`}
                    {` · ${run.model_version}`}
                  </p>
                </div>
                <Badge
                  variant={run.status === "success" ? "secondary" : run.status === "empty" ? "outline" : "destructive"}
                  className="capitalize"
                >
                  {run.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {run.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskScoreRunsHistory;