import React, { useState } from "react";

const DashboardTasksOverview: React.FC = () => {
  const [tasksByCategory] = useState([
    { code: "PM",   category: "Preventive",  total: 0, completed: 0 },
    { code: "RPR",  category: "Repairs",     total: 0, completed: 0 },
    { code: "INS",  category: "Inspections", total: 0, completed: 0 },
    { code: "SAF",  category: "Safety",      total: 0, completed: 0 },
  ]);

  const overallTotal = tasksByCategory.reduce((s, c) => s + c.total, 0);
  const overallCompleted = tasksByCategory.reduce((s, c) => s + c.completed, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="ticket-card h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display text-sm font-semibold">Task Throughput</h3>
        <span className="label-meta">WTD</span>
      </div>
      <div className="p-5 space-y-5">
        {tasksByCategory.map((c) => {
          const pct = c.total > 0 ? (c.completed / c.total) * 100 : 0;
          return (
            <div key={c.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-wider text-accent">{c.code}</span>
                  <span className="font-medium">{c.category}</span>
                </span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {c.completed}/{c.total}
                </span>
              </div>
              <div className="h-1 bg-muted overflow-hidden">
                <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        <div className="pt-4 mt-4 border-t border-dashed border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="label-meta">OVERALL</span>
            <span className="font-mono text-xs tabular-nums">
              {overallCompleted}/{overallTotal} · {overallPct}%
            </span>
          </div>
          <div className="h-1.5 bg-muted overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTasksOverview;
