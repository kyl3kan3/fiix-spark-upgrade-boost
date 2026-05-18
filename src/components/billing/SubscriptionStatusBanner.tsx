import { Link } from "react-router-dom";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

function daysUntil(iso: string | null) {
  if (!iso) return Infinity;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function SubscriptionStatusBanner() {
  const { data: sub } = useSubscription();
  if (!sub) return null;

  if (sub.status === "past_due") {
    return (
      <Banner tone="destructive" icon={<AlertTriangle className="h-4 w-4" />}>
        Payment failed — we're retrying. Update your card to avoid interruption.{" "}
        <Link to="/billing" className="underline font-medium">Manage billing</Link>
      </Banner>
    );
  }
  if (sub.cancel_at_period_end && sub.current_period_end) {
    return (
      <Banner tone="warning" icon={<XCircle className="h-4 w-4" />}>
        Subscription ends {new Date(sub.current_period_end).toLocaleDateString()}.{" "}
        <Link to="/billing" className="underline font-medium">Reactivate</Link>
      </Banner>
    );
  }
  if (sub.status === "trialing") {
    const d = daysUntil(sub.trial_ends_at);
    if (d <= 3 && d >= 0) {
      return (
        <Banner tone="warning" icon={<Clock className="h-4 w-4" />}>
          Your free trial ends in {d} day{d === 1 ? "" : "s"}. You'll be charged automatically.{" "}
          <Link to="/billing" className="underline font-medium">Manage billing</Link>
        </Banner>
      );
    }
  }
  return null;
}

function Banner({ tone, icon, children }: { tone: "destructive" | "warning"; icon: React.ReactNode; children: React.ReactNode }) {
  const cls =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-amber-100 text-amber-900 border-amber-300";
  return (
    <div className={`w-full border-b px-4 py-2 text-center text-sm flex items-center justify-center gap-2 ${cls}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}