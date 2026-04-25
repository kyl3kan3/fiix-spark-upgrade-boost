import React from "react";

const DashboardRecentActivities: React.FC = () => {
  // Mock activities until wired to real feed
  const activities: Array<{ id: string; code: string; title: string; meta: string; time: string }> = [];

  return (
    <div className="ticket-card h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display text-sm font-semibold">Activity Log</h3>
        <span className="label-meta">LIVE · 24H</span>
      </div>
      <div className="p-5">
        {activities.length > 0 ? (
          <div className="relative pl-5 border-l border-dashed border-border space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="relative">
                <span className="absolute -left-[22px] top-1 h-2 w-2 bg-accent rounded-full ring-4 ring-background" />
                <div className="font-mono text-[10px] tracking-wider uppercase text-accent">{a.code}</div>
                <div className="font-medium text-sm mt-0.5">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.meta}</div>
                <div className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">{a.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 border border-dashed border-border flex items-center justify-center mb-3">
              <span className="font-mono text-muted-foreground text-xs">∅</span>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              No activity recorded
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecentActivities;
