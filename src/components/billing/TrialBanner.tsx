import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialBanner() {
  const { data } = useSubscription();
  if (!data) return null;

  if (data.status === "trialing" && data.trial_ends_at) {
    const daysLeft = Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86_400_000);
    if (daysLeft > 7 || daysLeft < 0) return null;
    return (
      <div className="flex items-center justify-between gap-3 border-b bg-primary/10 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span>
            <strong>{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong> left in your free trial.
          </span>
        </div>
        <Button asChild size="sm" variant="default">
          <Link to="/billing">Manage plan</Link>
        </Button>
      </div>
    );
  }

  if (data.status === "past_due") {
    return (
      <div className="flex items-center justify-between gap-3 border-b bg-destructive/10 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span>Your payment is past due. Update billing to keep access.</span>
        </div>
        <Button asChild size="sm" variant="destructive">
          <Link to="/billing">Update billing</Link>
        </Button>
      </div>
    );
  }

  return null;
}