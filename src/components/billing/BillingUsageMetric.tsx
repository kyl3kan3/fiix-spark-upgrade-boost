import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";

interface BillingUsageMetricProps {
  icon: ReactNode;
  label: string;
  used: number;
  limit: number | null;
  hint?: string;
}

export default function BillingUsageMetric({
  icon,
  label,
  used,
  limit,
  hint,
}: BillingUsageMetricProps) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="bg-muted/40 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="font-headline text-2xl font-semibold text-foreground leading-none">
          {used}
        </span>
        <span className="text-sm text-muted-foreground leading-none pb-0.5">
          / {limit ?? "∞"}
        </span>
      </div>
      {limit !== null && (
        <Progress
          value={pct}
          className={`h-1.5 ${isHigh ? "[&>div]:bg-warning" : "[&>div]:bg-primary"}`}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}
