import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HardHat,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface SnapshotMember {
  id: string;
  name: string;
  avatar: string | null;
  online: boolean;
}

interface TodaySnapshotProps {
  completionRate: number | null;
  pendingJobs: number;
  highPriorityPendingJobs?: number;
  pendingAssetLabels?: string[];
  activeTechs: number;
  totalTechs: number;
  members?: SnapshotMember[];
  isLoading?: boolean;
}

/**
 * Today's Snapshot — 3-card KPI bento per
 * dashboard_maintenease_clean_tech/code.html lines 221-294.
 *
 * Each card: label + headline number, supporting visual (progress ring /
 * urgency chip / avatar pile), and a footer with delta or link.
 */
export function TodaySnapshot({
  completionRate,
  pendingJobs,
  activeTechs,
  totalTechs,
  highPriorityPendingJobs = 0,
  pendingAssetLabels = [],
  members = [],
  isLoading,
}: TodaySnapshotProps) {
  return (
    <section>
      <h3 className="font-headline text-xl text-foreground mb-4">
        Today's Snapshot
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CompletionCard rate={completionRate} isLoading={isLoading} />
        <PendingJobsCard
          count={pendingJobs}
          highPriorityCount={highPriorityPendingJobs}
          assetLabels={pendingAssetLabels}
          isLoading={isLoading}
        />
        <ActiveTechsCard active={activeTechs} total={totalTechs} members={members} />
      </div>
    </section>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-6 border border-transparent shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/10 flex flex-col relative overflow-hidden group",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold leading-snug tracking-[0.01em] text-muted-foreground uppercase">
      {children}
    </h4>
  );
}

function CompletionCard({
  rate,
  isLoading,
}: {
  rate: number | null;
  isLoading?: boolean;
}) {
  const display = rate === null ? "—" : `${rate}%`;

  return (
    <Card>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <CheckCircle2 className="h-16 w-16 text-success" />
      </div>
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
          <Label>Completion Rate</Label>
          <p className="font-headline text-3xl font-bold leading-tight mt-1 text-foreground">
            {display}
          </p>
        </div>
        <ProgressRing percent={rate ?? 0} color="hsl(var(--success))" />
      </div>
      <div className="mt-auto pt-4 border-t border-border/70 z-10">
        {rate === null ? (
          <p className="text-xs text-muted-foreground font-medium">
            {isLoading ? "Loading…" : "No work orders yet"}
          </p>
        ) : (
          <p className="text-xs text-success flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            Last 30 days
          </p>
        )}
      </div>
    </Card>
  );
}

function PendingJobsCard({
  count,
  highPriorityCount,
  assetLabels,
  isLoading,
}: {
  count: number;
  highPriorityCount: number;
  assetLabels: string[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <AlertTriangle className="h-16 w-16 text-warning" />
      </div>
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
          <Label>Pending Jobs</Label>
          <p className="font-headline text-3xl font-bold leading-tight mt-1 text-foreground">
            {isLoading ? "—" : count}
          </p>
        </div>
        {highPriorityCount > 0 && (
          <div className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-bold text-warning">
            <AlertTriangle className="h-3 w-3" />
            {highPriorityCount} High
          </div>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/70 pt-4 z-10">
        {count === 0 && !isLoading ? (
          <p className="text-xs text-muted-foreground font-medium">
            Nothing waiting — all caught up
          </p>
        ) : (
          assetLabels.map((chip, index) => (
            <Link
              key={`${chip}-${index}`}
              to="/work-orders"
              className={cn(
                "inline-flex items-center rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                "bg-muted text-foreground hover:bg-muted/80",
              )}
            >
              {chip}
            </Link>
          ))
        )}
        <Link
          to="/work-orders"
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-warning bg-warning/10 hover:bg-warning/20 transition-colors"
        >
          Open
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ActiveTechsCard({
  active,
  total,
  members,
}: {
  active: number;
  total: number;
  members: SnapshotMember[];
}) {
  const shown = members.slice(0, 3);
  const others = Math.max(0, total - shown.length);

  return (
    <Card>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <HardHat className="h-16 w-16 text-primary" />
      </div>
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
          <Label>Active Techs</Label>
          <p className="font-headline text-3xl font-bold leading-tight mt-1 text-foreground">
            {active}
            {total > 0 && (
              <span className="text-base text-muted-foreground font-normal">
                {" "}
                / {total}
              </span>
            )}
          </p>
        </div>
        {shown.length > 0 && (
          <div className="flex -space-x-2">
            {shown.map((member) => (
              <span key={member.id} className="relative inline-block" title={member.name}>
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-8 w-8 rounded-full border-2 border-card object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border-2 border-card text-[10px] font-bold text-primary">
                    {initials(member.name) || "?"}
                  </span>
                )}
                {member.online && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-card" />
                )}
              </span>
            ))}
            {others > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-card text-[10px] font-bold text-muted-foreground">
                +{others}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-border/70 z-10">
        <Link
          to="/team"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          View Schedule
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const offset = 100 - Math.max(0, Math.min(100, percent));

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="100, 100"
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
    </div>
  );
}
