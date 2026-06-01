import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasFeature, useSubscription, TIER_FEATURES } from "@/hooks/useSubscription";

interface Props {
  feature: keyof typeof TIER_FEATURES["starter"];
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PaywallGate({ feature, children, title, description }: Props) {
  const allowed = useHasFeature(feature);
  const { isLoading } = useSubscription();
  if (isLoading) return null;
  if (allowed) return <>{children}</>;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-12 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-headline text-xl font-semibold text-foreground">
          {title ?? "Upgrade to unlock"}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground mt-2">
          {description ?? "This feature is included in the Pro and Business plans."}
        </p>
      </div>
      <Button
        asChild
        className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold"
      >
        <Link to="/pricing">View plans</Link>
      </Button>
    </div>
  );
}
