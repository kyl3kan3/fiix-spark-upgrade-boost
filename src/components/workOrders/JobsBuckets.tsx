import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import { toast } from "sonner";
import {
  AlertOctagon, Clock, Wrench, CheckCircle2, ChevronRight,
  MapPin, User, Calendar as CalendarIcon, Play, CheckCheck, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  WorkOrderStatus, WorkOrderPriority, WorkOrderWithRelations,
} from "@/types/workOrders";

type BucketKey = "urgent" | "todo" | "in_progress" | "done";

interface BucketDef {
  key: BucketKey;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind classes for the bucket's accent (icon chip + count) */
  accent: string;
  /** Lighter background for the bucket header card */
  surface: string;
}

const BUCKETS: BucketDef[] = [
  {
    key: "urgent",
    label: "Right away",
    hint: "Broken, unsafe, or overdue — handle first",
    icon: AlertOctagon,
    accent: "bg-destructive text-destructive-foreground",
    surface: "bg-destructive/5 border-destructive/20",
  },
  {
    key: "todo",
    label: "Up next",
    hint: "Waiting to be picked up",
    icon: Clock,
    accent: "bg-amber-500 text-white",
    surface: "bg-amber-500/5 border-amber-500/20",
  },
  {
    key: "in_progress",
    label: "Being worked on",
    hint: "Someone is on it right now",
    icon: Wrench,
    accent: "bg-primary text-primary-foreground",
    surface: "bg-primary/5 border-primary/20",
  },
  {
    key: "done",
    label: "Done",
    hint: "Finished — keep for the record",
    icon: CheckCircle2,
    accent: "bg-emerald-600 text-white",
    surface: "bg-emerald-600/5 border-emerald-600/20",
  },
];

/** Decide which bucket a job belongs in. "Urgent" wins over "todo". */
const bucketFor = (wo: WorkOrderWithRelations): BucketKey => {
  if (wo.status === "completed") return "done";
  if (wo.status === "in_progress") return "in_progress";
  // pending / on_hold / cancelled all fall here
  const isUrgentPriority = wo.priority === "high" || wo.priority === "urgent";
  const isOverdue = wo.due_date ? isPast(new Date(wo.due_date)) && !isToday(new Date(wo.due_date)) : false;
  if (isUrgentPriority || isOverdue) return "urgent";
  return "todo";
};

const priorityLabel = (p: WorkOrderPriority): string => {
  switch (p) {
    case "urgent": return "Right away";
    case "high":   return "Soon";
    case "medium": return "When you can";
    case "low":    return "Whenever";
    default:       return p;
  }
};

/** Next status when the user taps the primary action on a card */
const nextStatus = (s: WorkOrderStatus): WorkOrderStatus | null => {
  if (s === "pending") return "in_progress";
  if (s === "in_progress") return "completed";
  return null;
};

const nextStatusLabel = (s: WorkOrderStatus): string => {
  if (s === "pending") return "Start";
  if (s === "in_progress") return "Mark done";
  return "";
};

const NextIcon = ({ status, className }: { status: WorkOrderStatus; className?: string }) => {
  if (status === "pending") return <Play className={className} />;
  if (status === "in_progress") return <CheckCheck className={className} />;
  return null;
};

interface JobCardProps {
  job: WorkOrderWithRelations;
  onAdvance: (job: WorkOrderWithRelations) => void;
  isUpdating: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onAdvance, isUpdating }) => {
  const navigate = useNavigate();
  const due = job.due_date ? new Date(job.due_date) : null;
  const overdue = due ? isPast(due) && !isToday(due) && job.status !== "completed" : false;
  const next = nextStatus(job.status);
  const assignee = job.assignee
    ? `${job.assignee.first_name || ""} ${job.assignee.last_name || ""}`.trim() || "Unassigned"
    : "Unassigned";

  return (
    <Card
      onClick={() => navigate(`/work-orders/${job.id}`)}
      className="group cursor-pointer border-2 hover:border-primary/40 transition-all p-4 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display font-extrabold text-base leading-tight line-clamp-2">
            {job.title}
          </div>
          {job.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-muted-foreground">
        {job.asset?.name && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[140px]">{job.asset.name}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {assignee}
        </span>
        {due && (
          <span className={cn(
            "inline-flex items-center gap-1.5",
            overdue && "text-destructive",
          )}>
            <CalendarIcon className="h-3.5 w-3.5" />
            {overdue ? "Overdue · " : ""}{format(due, "MMM d")}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn(
            "font-bold",
            (job.priority === "urgent" || job.priority === "high") && "border-destructive/40 text-destructive",
          )}
        >
          {priorityLabel(job.priority)}
        </Badge>
        {next && (
          <Button
            size="sm"
            variant={job.status === "in_progress" ? "default" : "secondary"}
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(job);
            }}
          >
            <NextIcon status={job.status} className="h-4 w-4" />
            {nextStatusLabel(job.status)}
          </Button>
        )}
      </div>
    </Card>
  );
};

interface JobsBucketsProps {
  jobs: WorkOrderWithRelations[];
}

const JobsBuckets: React.FC<JobsBucketsProps> = ({ jobs }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeBucket, setActiveBucket] = useState<BucketKey | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      j.asset?.name?.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  const grouped = useMemo(() => {
    const map: Record<BucketKey, WorkOrderWithRelations[]> = {
      urgent: [], todo: [], in_progress: [], done: [],
    };
    for (const j of filtered) map[bucketFor(j)].push(j);
    return map;
  }, [filtered]);

  const handleAdvance = async (job: WorkOrderWithRelations) => {
    const next = nextStatus(job.status);
    if (!next) return;
    setUpdatingId(job.id);
    const { error } = await supabase
      .from("work_orders")
      .update({ status: next })
      .eq("id", job.id);
    setUpdatingId(null);
    if (error) {
      toast.error("Couldn't update job", { description: error.message });
      return;
    }
    toast.success(next === "in_progress" ? "Started — good luck!" : "Marked done. Nice work.");
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
  };

  const visibleBuckets = activeBucket === "all" ? BUCKETS : BUCKETS.filter(b => b.key === activeBucket);

  return (
    <div className="space-y-6">
      {/* Search + bucket filter chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a job, place, or thing…"
            className="pl-10 h-12 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveBucket("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors",
              activeBucket === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-foreground border-border hover:border-foreground/40",
            )}
          >
            Everything · {filtered.length}
          </button>
          {BUCKETS.map((b) => {
            const count = grouped[b.key].length;
            const Icon = b.icon;
            const active = activeBucket === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setActiveBucket(active ? "all" : b.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors inline-flex items-center gap-2",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground border-border hover:border-foreground/40",
                )}
              >
                <Icon className="h-4 w-4" />
                {b.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buckets */}
      <div className="space-y-6">
        {visibleBuckets.map((b) => {
          const items = grouped[b.key];
          const Icon = b.icon;
          return (
            <section key={b.key} className="space-y-3">
              <div className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-4 py-3",
                b.surface,
              )}>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", b.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-extrabold text-lg leading-tight">
                    {b.label}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">{b.hint}</div>
                </div>
                <div className={cn(
                  "h-9 min-w-9 px-2.5 rounded-full flex items-center justify-center font-display font-extrabold",
                  b.accent,
                )}>
                  {items.length}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground italic px-2">
                  Nothing here right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onAdvance={handleAdvance}
                      isUpdating={updatingId === job.id}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default JobsBuckets;