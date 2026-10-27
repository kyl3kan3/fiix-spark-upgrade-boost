import { Card } from "@/components/ui/card";
import QueryErrorState from "@/components/common/QueryErrorState";
import { useMttrSummary } from "@/hooks/useMaintenanceCodes";
import { Link } from "react-router-dom";

export function MttrReportPanel() {
  const { data = [], isLoading, error, refetch } = useMttrSummary(90);

  if (error) {
    return <QueryErrorState title="Could not load MTTR summary." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Mean time to repair (MTTR) from completed jobs with failure codes and logged downtime minutes.
        Manage codes on the{" "}
        <Link to="/maintenance-codes" className="text-primary hover:underline">maintenance codes</Link> page.
      </p>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="p-3">Failure code</th>
              <th className="p-3">Jobs</th>
              <th className="p-3">Avg downtime (min)</th>
              <th className="p-3">Total downtime (min)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-muted-foreground">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No completed jobs with failure codes and downtime in the last 90 days.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.failure_code_id} className="border-b">
                  <td className="p-3">
                    <span className="font-mono text-xs mr-2">{row.code}</span>
                    {row.label}
                  </td>
                  <td className="p-3">{row.completed_jobs}</td>
                  <td className="p-3">{row.avg_downtime_minutes ?? "—"}</td>
                  <td className="p-3">{row.total_downtime_minutes ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
