import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMaintenanceActivity,
  type PrioritySlice,
} from "@/hooks/dashboard/useMaintenanceActivity";

/**
 * The dashboard's activity chart — the in-app counterpart of the grouped-bar
 * "Downtime Prevention" panel shown in the landing-page hero mockup: weekly
 * opened-vs-completed columns beside an open-work priority breakdown.
 *
 * Series colors come from --chart-series-1/2 (index.css), validated for
 * lightness/chroma/CVD/contrast against both card surfaces.
 */

const SERIES = [
  { key: "opened" as const, label: "Opened", cssVar: "var(--chart-series-1)" },
  { key: "completed" as const, label: "Completed", cssVar: "var(--chart-series-2)" },
];

const PRIORITY_STYLES: Record<
  PrioritySlice["priority"],
  { label: string; bar: string; text: string }
> = {
  urgent: { label: "Urgent", bar: "bg-destructive", text: "text-destructive" },
  high: { label: "High", bar: "bg-warning", text: "text-warning" },
  medium: { label: "Medium", bar: "bg-primary", text: "text-primary" },
  low: { label: "Low", bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
};

export function MaintenanceActivityCard() {
  const { weeks, priorities, totalActivity, totalOpen, isLoading } =
    useMaintenanceActivity();

  return (
    <section className="mt-8">
      <h3 className="font-headline text-xl text-foreground mb-4">
        Maintenance activity
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="surface-card p-5 lg:col-span-2 flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Work orders opened vs completed · last 6 weeks
            </p>
            <div className="flex items-center gap-4">
              {SERIES.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: s.cssVar }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : totalActivity === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No work-order activity yet — the chart fills in as jobs are opened and completed.
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeks} barGap={2} barCategoryGap="28%">
                    <CartesianGrid
                      vertical={false}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    {SERIES.map((s) => (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label}
                        fill={s.cssVar}
                        maxBarSize={18}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Screen-reader table view of the plotted values */}
              <table className="sr-only">
                <caption>Work orders opened and completed per week, last 6 weeks</caption>
                <thead>
                  <tr>
                    <th>Week of</th>
                    <th>Opened</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => (
                    <tr key={w.label}>
                      <td>{w.label}</td>
                      <td>{w.opened}</td>
                      <td>{w.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="surface-card p-5 flex flex-col">
          <p className="text-sm text-muted-foreground mb-4">
            Open work by priority
          </p>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : totalOpen === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Nothing open right now.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-4">
              {priorities.map(({ priority, count }) => {
                const style = PRIORITY_STYLES[priority];
                const pct = totalOpen > 0 ? Math.round((count / totalOpen) * 100) : 0;
                return (
                  <div key={priority}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{style.label}</span>
                      <span className={`font-bold ${style.text}`}>
                        {count}
                        <span className="ml-1 font-normal text-muted-foreground">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${style.bar} transition-[width] duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
