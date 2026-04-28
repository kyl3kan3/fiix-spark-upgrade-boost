
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, ArrowRight, ClipboardCheck } from "lucide-react";
import { checklistService } from "@/services/checklistService";

/**
 * "Start a Check-Up" entry point.
 * A check-up = filling out a saved checklist. Instead of a fake form that
 * silently dropped data, this lets the worker pick a checklist and start it.
 */
const NewInspectionForm: React.FC = () => {
  const navigate = useNavigate();

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["checklists"],
    queryFn: checklistService.getChecklists,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-6 text-muted-foreground font-semibold">Loading check-ups…</div>
      </Card>
    );
  }

  if (checklists.length === 0) {
    return (
      <Card className="p-8 text-center space-y-4 border-2 border-dashed">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
          <ListChecks className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-xl">No check-ups set up yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            A check-up is a list of things to walk through and tick off — like a safety check or a daily equipment look-over.
          </p>
        </div>
        <Button variant="accent" size="lg" onClick={() => navigate("/checklists/new")}>
          Create the first check-up
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground font-medium">
        Pick a check-up to start. Tap one to walk through it step by step.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checklists.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/checklists/${c.id}/submit`)}
            className="group text-left p-5 rounded-3xl border-2 border-border bg-card hover:border-primary/40 transition-all flex items-start gap-4 shadow-soft"
          >
            <div className="h-12 w-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-extrabold text-lg leading-tight truncate">{c.name}</div>
              {c.description && (
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
              )}
              <div className="text-xs font-bold text-muted-foreground mt-2">
                {c.items?.length || 0} steps
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary self-center" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewInspectionForm;
