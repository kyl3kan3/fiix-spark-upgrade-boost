import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell, ChevronRight, Clock, AlertTriangle, CalendarDays, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checklistService } from "@/services/checklistService";
import { Checklist, ChecklistFrequencies } from "@/types/checklists";
import { format, formatDistanceToNowStrict, isToday, startOfDay, endOfDay } from "date-fns";

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

  return (
    <button
      onClick={() => navigate(`/checklists/${checklist.id}/submit`)}
      className="w-full flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-secondary/40 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{checklist.name}</div>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
          <Badge variant="outline" className="text-[10px]">{freqLabel(checklist.frequency)}</Badge>
          {(checklist.asset_ids?.length || 0) > 0 && (
            <span className="text-muted-foreground">
              {checklist.asset_ids!.length} unit{checklist.asset_ids!.length === 1 ? "" : "s"}
            </span>
          )}
          <span className={`font-medium ${dueTone}`}>{dueLabel}</span>
        </div>
      </div>
      <Button size="sm" variant="outline" className="shrink-0 pointer-events-none">
        Start
        <ChevronRight className="h-4 w-4" />
      </Button>
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
  const toneClasses = {
    destructive: "border-destructive/40 bg-destructive/5 text-destructive",
    warning: "border-warning/40 bg-warning/5 text-warning",
    info: "border-info/40 bg-info/5 text-info",
  }[tone];

  return (
    <Card className={`p-5 border-2 ${toneClasses.split(" ").filter(c => c.startsWith("border") || c.startsWith("bg")).join(" ")}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="shrink-0">{items.length}</Badge>
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