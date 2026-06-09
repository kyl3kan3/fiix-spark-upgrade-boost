import { Link } from "react-router-dom";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { TRIAL_DAYS } from "@/constants/trial";

export function TrialBanner() {
 const { data } = useSubscription();
 if (!data) return null;

 if (data.status === "trialing" && data.trial_ends_at) {
 const msLeft = new Date(data.trial_ends_at).getTime() - Date.now();
 const daysLeft = Math.max(0, Math.ceil(msLeft / 86_400_000));
 const hoursLeft = Math.max(0, Math.ceil(msLeft / 3_600_000));
 if (msLeft < 0) return null;

 // Always show countdown for the whole 7-day trial. Get louder under 2 days.
 const urgent = daysLeft <= 2;
 const timeText =
 daysLeft >= 1
 ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
 : `${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"} left`;

 return (
 <div
 data-trial-days={daysLeft}
 data-trial-length={TRIAL_DAYS}
 className={`flex items-center justify-between gap-3 border-b px-4 py-2 text-sm ${
 urgent ? "bg-destructive/10" : "bg-primary/10"
 }`}
 >
 <div className="flex items-center gap-2">
 {urgent ? (
 <AlertCircle className="h-4 w-4 text-destructive" />
 ) : (
 <Clock className="h-4 w-4 text-primary" />
 )}
 <span>
 <strong>{timeText}</strong> in your {TRIAL_DAYS}-day free trial.
 </span>
 </div>
 <Button asChild size="sm" variant={urgent ? "destructive" : "default"}>
 <Link to="/billing">{urgent ? "Add payment" : "Manage plan"}</Link>
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