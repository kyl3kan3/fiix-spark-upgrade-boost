import React, { useState } from "react";

const DashboardTasksOverview: React.FC = () => {
  const [tasksByCategory] = useState([
    { category: "Routine upkeep", total: 0, completed: 0 },
    { category: "Repairs",        total: 0, completed: 0 },
    { category: "Check-ups",      total: 0, completed: 0 },
    { category: "Safety",         total: 0, completed: 0 },
  ]);

  const overallTotal = tasksByCategory.reduce((s, c) => s + c.total, 0);
  const overallCompleted = tasksByCategory.reduce((s, c) => s + c.completed, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="rounded-3xl border-2 border-border bg-card h-full">
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <h3 className="font-display text-base font-bold">This week's progress</h3>
      </div>
      <div className="p-5 space-y-5">
        {tasksByCategory.map((c) => {
          const pct = c.total > 0 ? (c.completed / c.total) * 100 : 0;
          return (
            <div key={c.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{c.category}</span>
                <span className="text-muted-foreground tabular-nums font-semibold">
                  {c.completed} of {c.total} done
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        <div className="pt-4 mt-4 border-t-2 border-dashed border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">Overall</span>
            <span className="text-sm tabular-nums font-bold">
              {overallPct}% complete
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTasksOverview;
