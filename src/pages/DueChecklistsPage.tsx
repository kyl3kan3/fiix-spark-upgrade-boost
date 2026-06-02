import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell, ChevronRight, AlertTriangle, CalendarDays, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { checklistService } from "@/services/checklistService";
import { Checklist, ChecklistFrequencies } from "@/types/checklists";
import { format, formatDistanceToNowStrict, isToday, startOfDay, endOfDay } from "date-fns";
import { dueAssetIds } from "@/lib/checklists/scheduling";

type Bucket = "overdue" | "today" | "upcoming";

const bucketFor = (nextDueAt: string | null | undefined): Bucket | null => {
 if (!nextDueAt) return null;
 const due = new Date(nextDueAt);
 const now = new Date();
 if (due < startOfDay(now)) return "overdue";
 if (due <= endOfDay(now)) return "today";
 return "upcoming";
};

const freqLabel = (v: string) =>
 ChecklistFrequencies.find((f) => f.value === v)?.label || v;

const ChecklistRow: React.FC<{ checklist: Checklist; bucket: Bucket }> = ({ checklist, bucket }) => {
 const navigate = useNavigate();
 const due = checklist.schedule?.next_due_at ? new Date(checklist.schedule.next_due_at) : null;

 const dueLabel = due
 ? bucket === "overdue"
 ? `Overdue by ${formatDistanceToNowStrict(due)}`
 : isToday(due)
 ? `Due ${format(due, "h:mm a")}`
 : `Due ${format(due, "MMM d, h:mm a")}`
 : "No schedule";

 const dueTone =
 bucket === "overdue"
 ? "text-destructive"
 : bucket === "today"
 ? "text-warning"
 : "text-muted-foreground";

 const total = checklist.asset_ids?.length ?? 0;
 const readyNow = total
 ? dueAssetIds(
 checklist.schedule?.next_due_at,
 checklist.asset_ids ?? [],
 checklist.asset_offsets ?? {},
 ).length
 : 0;
 const waiting = total - readyNow;

 return (
 <button
 onClick={() => navigate(`/checklists/${checklist.id}/submit`)}
 className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/20 transition-colors text-left group"
 >
 <div className="flex-1 min-w-0">
 <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
 {checklist.name}
 </div>
 <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-muted text-muted-foreground border border-border">
 {freqLabel(checklist.frequency)}
 </span>
 {total > 0 && (
 <span className="text-muted-foreground">
 {readyNow}/{total} ready
 {waiting > 0 && bucket !== "upcoming" && (
 <span className="ml-1 text-primary">· {waiting} staggered</span>
 )}
 </span>
 )}
 <span className={`font-medium ${dueTone}`}>{dueLabel}</span>
 </div>
 </div>
 <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 rounded-lg px-3 py-1.5 pointer-events-none">
 Start
 <ChevronRight className="h-3.5 w-3.5" />
 </div>
 </button>
 );
};

const Section: React.FC<{
 title: string;
 description: string;
 icon: React.ElementType;
 tone: "destructive" | "warning" | "info";
 items: Checklist[];
 emptyText: string;
}> = ({ title, description, icon: Icon, tone, items, emptyText }) => {
 const iconTone = {
 destructive: "bg-destructive/10 text-destructive",
 warning: "bg-warning/10 text-warning",
 info: "bg-primary/10 text-primary",
 }[tone];

 const borderTone = {
 destructive: "border-destructive/25",
 warning: "border-warning/25",
 info: "border-primary/15",
 }[tone];

 return (
 <Card className={`p-5 border-2 ${borderTone} shadow-sm`}>
 <div className="flex items-start gap-3 mb-4">
 <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}>
 <Icon className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <h2 className="font-headline font-bold text-lg leading-tight">{title}</h2>
 <p className="text-sm text-muted-foreground">{description}</p>
 </div>
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
 {items.length}
 </span>
 </div>

 {items.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
 ) : (
 <div className="space-y-2">
 {items.map((c) => (
 <ChecklistRow key={c.id} checklist={c} bucket={
 tone === "destructive" ? "overdue" : tone === "warning" ? "today" : "upcoming"
 } />
 ))}
 </div>
 )}
 </Card>
 );
};

const DueChecklistsPage: React.FC = () => {
 const navigate = useNavigate();
 const { data: scheduled = [], isLoading } = useQuery({
 queryKey: ["scheduled-checklists"],
 queryFn: checklistService.getScheduledChecklists,
 refetchInterval: 5 * 60 * 1000,
 });

 const { overdue, today, upcoming } = useMemo(() => {
 const groups: { overdue: Checklist[]; today: Checklist[]; upcoming: Checklist[] } = {
 overdue: [],
 today: [],
 upcoming: [],
 };
 scheduled.forEach((c) => {
 const b = bucketFor(c.schedule?.next_due_at);
 if (b) groups[b].push(c);
 });
 // Cap upcoming to next 7 days for relevance.
 const sevenDays = new Date();
 sevenDays.setDate(sevenDays.getDate() + 7);
 groups.upcoming = groups.upcoming.filter((c) => {
 const d = c.schedule?.next_due_at ? new Date(c.schedule.next_due_at) : null;
 return d && d <= sevenDays;
 });
 return groups;
 }, [scheduled]);

 return (
 <DashboardLayout>
 <div className="px-4 md:px-6 lg:px-8 pt-6">
 <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-2">
 <ArrowLeft className="h-4 w-4" />
 Back to Dashboard
 </Button>
 </div>
 <PageHeader
 title="Due Inspections"
 description="What needs checking today, plus anything overdue or coming up."
 actions={
 <Button variant="outline" size="lg" onClick={() => navigate("/checklists")}>
 All Checklists
 </Button>
 }
 />

 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
 {isLoading ? (
 <div className="text-center py-12 text-muted-foreground">Loading…</div>
 ) : scheduled.length === 0 ? (
 <Card className="p-12 text-center">
 <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-4" />
 <h3 className="font-display font-bold text-lg mb-2">No scheduled checklists</h3>
 <p className="text-muted-foreground mb-6">
 Create a checklist with a recurring frequency to start seeing prompts here.
 </p>
 <Button onClick={() => navigate("/checklists/new")}>Create a Checklist</Button>
 </Card>
 ) : (
 <>
 <Section
 title="Overdue"
 description="Past their due time — get to these first."
 icon={AlertTriangle}
 tone="destructive"
 items={overdue}
 emptyText="Nothing overdue. 🎉"
 />
 <Section
 title="Due today"
 description="Scheduled to be done before end of day."
 icon={Bell}
 tone="warning"
 items={today}
 emptyText="All caught up for today."
 />
 <Section
 title="Coming up (next 7 days)"
 description="Plan ahead — these are queued up."
 icon={CalendarDays}
 tone="info"
 items={upcoming}
 emptyText="Nothing scheduled in the next week."
 />
 </>
 )}
 </div>
 </DashboardLayout>
 );
};

export default DueChecklistsPage;