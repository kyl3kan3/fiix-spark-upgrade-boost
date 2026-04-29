import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboardingProgress } from "@/hooks/onboarding/useOnboardingProgress";
import { useTaskAutoComplete } from "@/hooks/onboarding/useTaskAutoComplete";
import { OnboardingTaskKey } from "@/services/onboarding/onboardingService";

interface TaskDef {
  key: OnboardingTaskKey;
  title: string;
  href: string;
}

const TASKS: TaskDef[] = [
  { key: "first_location", title: "Add your first location", href: "/locations" },
  { key: "first_asset", title: "Add your first asset", href: "/assets/new" },
  { key: "first_vendor", title: "Add your first vendor", href: "/vendors/new" },
  { key: "first_work_order", title: "Create your first work order", href: "/work-orders/new" },
  { key: "invited_teammate", title: "Invite a teammate", href: "/team" },
];

const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { progress, dismissChecklist, restartTour } = useOnboardingProgress();
  useTaskAutoComplete();

  if (!progress) return null;
  if (progress.checklist_dismissed) return null;

  const done = TASKS.filter((t) => progress.tasks_completed?.[t.key]).length;
  const total = TASKS.length;
  const pct = (done / total) * 100;
  const allDone = done === total;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {allDone ? "You're all set!" : "Get started with MaintenEase"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => dismissChecklist()}
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {done} / {total}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1">
          {TASKS.map((task) => {
            const isDone = !!progress.tasks_completed?.[task.key];
            return (
              <li key={task.key}>
                <button
                  type="button"
                  onClick={() => !isDone && navigate(task.href)}
                  disabled={isDone}
                  className="w-full flex items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-muted/50 transition-colors disabled:opacity-70 disabled:cursor-default"
                >
                  <span className="flex items-center gap-3">
                    {isDone ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={
                        isDone
                          ? "line-through text-muted-foreground"
                          : "font-medium text-foreground"
                      }
                    >
                      {task.title}
                    </span>
                  </span>
                  {!isDone && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => restartTour()}>
            Take the product tour
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/setup")}>
            Resume setup wizard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;