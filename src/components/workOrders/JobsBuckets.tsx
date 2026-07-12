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
 accent: "bg-warning text-white",
 surface: "bg-warning/5 border-warning/20",
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
 accent: "bg-success text-white",
 surface: "bg-success/5 border-success/20",
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
 case "high": return "Soon";
 case "medium": return "When you can";
 case "low": return "Whenever";
 default: return p;
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

const priorityPillClasses = (p: WorkOrderPriority): string => {
 switch (p) {
 case "urgent":
 return "bg-destructive/10 text-destructive border-destructive/30";
 case "high":
 return "bg-destructive/10 text-destructive border-destructive/30";
 case "medium":
 return "bg-warning/10 text-warning border-warning/30";
 case "low":
 return "bg-muted text-muted-foreground border-border";
 default:
 return "bg-muted text-muted-foreground border-border";
 }
};

const JobCard: React.FC<JobCardProps> = ({ job, onAdvance, isUpdating }) => {
 const navigate = useNavigate();
 const due = job.due_date ? new Date(job.due_date) : null;
 const overdue = due ? isPast(due) && !isToday(due) && job.status !== "completed" : false;
 const next = nextStatus(job.status);
 const assignee = job.assignee
 ? `${job.assignee.first_name || ""} ${job.assignee.last_name || ""}`.trim() || "Unassigned"
 : "Unassigned";

 return (
 <div
 onClick={() => navigate(`/work-orders/${job.id}`)}
 className="group cursor-pointer rounded-xl bg-surface-container-lowest border border-transparent hover:border-primary/10 shadow-sm hover:shadow-md transition-ui duration-300 overflow-hidden"
 >
 {/* Card body */}
 <div className="p-6">
 <div className="flex justify-between items-start mb-4">
 <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
 #{job.id.split("-")[0].toUpperCase()}
 </span>
 <span className={cn(
 "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
 priorityPillClasses(job.priority),
 )}>
 {priorityLabel(job.priority)}
 </span>
 </div>

 <h4 className="font-headline font-semibold text-base leading-snug text-foreground mb-1.5 line-clamp-2">
 {job.title}
 </h4>
 {job.description && (
 <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
 )}

 <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-5">
 <div>
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Assigned</p>
 <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
 <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
 <span className="truncate">{assignee}</span>
 </p>
 </div>
 <div>
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Due</p>
 {due ? (
 <p className={cn(
 "text-sm font-semibold flex items-center gap-1.5",
 overdue ? "text-destructive" : "text-foreground",
 )}>
 <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
 {overdue ? "Overdue · " : ""}{format(due, "MMM d")}
 </p>
 ) : (
 <p className="text-sm text-muted-foreground">—</p>
 )}
 </div>
 {job.asset?.name && (
 <div className="col-span-2">
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Asset</p>
 <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
 <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
 <span className="truncate">{job.asset.name}</span>
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Card footer */}
 <div className="bg-muted/20 px-6 py-3.5 flex justify-between items-center group-hover:bg-muted/40 transition-colors border-t border-border/40">
 <button
 className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider"
 onClick={(e) => { e.stopPropagation(); navigate(`/work-orders/${job.id}`); }}
 >
 <ChevronRight className="h-3.5 w-3.5" /> View
 </button>
 {next && (
 <Button
 size="sm"
 variant={job.status === "in_progress" ? "default" : "outline"}
 disabled={isUpdating}
 onClick={(e) => { e.stopPropagation(); onAdvance(job); }}
 className="h-7 text-xs"
 >
 <NextIcon status={job.status} className="h-3.5 w-3.5" />
 {nextStatusLabel(job.status)}
 </Button>
 )}
 </div>
 </div>
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
 <div className="space-y-8">
 {/* Search + bucket filter chips */}
 <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search jobs, assets, or locations…"
 className="pl-10 h-11 bg-surface-container-lowest border-border/60 focus-visible:ring-primary/30"
 />
 </div>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => setActiveBucket("all")}
 className={cn(
 "px-4 py-1.5 rounded-full text-sm font-semibold border transition-ui duration-200",
 activeBucket === "all"
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-surface-container-lowest text-foreground border-border hover:border-primary/40 hover:bg-muted/30",
 )}
 >
 All · {filtered.length}
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
 "px-4 py-1.5 rounded-full text-sm font-semibold border transition-ui duration-200 inline-flex items-center gap-1.5",
 active
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-surface-container-lowest text-foreground border-border hover:border-primary/40 hover:bg-muted/30",
 )}
 >
 <Icon className="h-3.5 w-3.5" />
 {b.label} · {count}
 </button>
 );
 })}
 </div>
 </div>

 {/* Buckets */}
 <div className="space-y-8">
 {visibleBuckets.map((b) => {
 const items = grouped[b.key];
 const Icon = b.icon;
 return (
 <section key={b.key} className="space-y-4">
 {/* Bucket header */}
 <div className={cn(
 "flex items-center gap-3 rounded-xl border px-4 py-3",
 b.surface,
 )}>
 <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", b.accent)}>
 <Icon className="h-4.5 w-4.5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-headline font-bold text-base leading-tight">
 {b.label}
 </div>
 <div className="text-xs text-muted-foreground">{b.hint}</div>
 </div>
 <div className={cn(
 "h-8 min-w-8 px-2.5 rounded-full flex items-center justify-center text-sm font-bold",
 b.accent,
 )}>
 {items.length}
 </div>
 </div>

 {items.length === 0 ? (
 <div className="text-sm text-muted-foreground italic px-1 py-2">
 Nothing here right now.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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