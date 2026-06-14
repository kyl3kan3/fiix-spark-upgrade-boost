import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useRunActions } from "@/hooks/useSelfHealing";
import type { SelfHealingRun } from "@/services/selfHealingService";
import { formatDistanceToNow } from "date-fns";

interface Props {
  runs: SelfHealingRun[];
  isLoading: boolean;
}

const HEALER_LABELS: Record<string, string> = {
  risk_scoring: "Risk scoring",
  work_orders: "Work orders",
  data_integrity: "Data integrity",
  ai_triage: "AI triage",
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "success") return "default";
  if (status === "failed") return "destructive";
  if (status === "partial") return "secondary";
  return "outline";
}

function ActionsRow({ runId }: { runId: string }) {
  const { data, isLoading } = useRunActions(runId);
  if (isLoading) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading actions…
      </div>
    );
  }
  if (!data || data.length === 0) {
    return <div className="px-4 py-3 text-sm text-muted-foreground">No individual actions recorded.</div>;
  }
  return (
    <div className="px-4 py-3 space-y-2">
      {data.map((a) => (
        <div key={a.id} className="text-sm border-l-2 pl-3 py-1" style={{ borderColor: a.requires_review ? "hsl(var(--destructive))" : "hsl(var(--border))" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{a.action}</Badge>
            <span className="text-xs text-muted-foreground">{a.entity_type}</span>
            {a.requires_review && <Badge variant="destructive" className="text-xs">needs review</Badge>}
          </div>
          {a.details && <p className="mt-1 text-foreground">{a.details}</p>}
        </div>
      ))}
    </div>
  );
}

export default function RunsTable({ runs, isLoading }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent runs</CardTitle>
        <CardDescription>Audit log of every self-healing run for your tenant.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading runs…
          </div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No runs yet. Use the "Run all healers now" button above to kick one off, or wait for the scheduled run.
          </div>
        ) : (
          <div className="divide-y">
            {runs.map((run) => {
              const isOpen = expanded === run.id;
              return (
                <div key={run.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : run.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 text-left"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                      <div className="text-sm font-medium">{HEALER_LABELS[run.healer] ?? run.healer}</div>
                      <Badge variant={statusVariant(run.status)} className="w-fit">{run.status}</Badge>
                      <div className="text-xs text-muted-foreground">scanned <b className="text-foreground">{run.scanned}</b></div>
                      <div className="text-xs text-muted-foreground">fixed <b className="text-foreground">{run.fixed}</b></div>
                      <div className="text-xs text-muted-foreground">flagged <b className="text-foreground">{run.flagged}</b></div>
                      <div className="text-xs text-muted-foreground text-right">
                        {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                        {run.triggered_by === "manual" && " · manual"}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="bg-muted/30 border-t">
                      {run.error_message && (
                        <div className="px-4 pt-3 text-sm text-destructive">{run.error_message}</div>
                      )}
                      <ActionsRow runId={run.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}