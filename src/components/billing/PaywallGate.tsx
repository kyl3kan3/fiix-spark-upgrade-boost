import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{title ?? "Upgrade to unlock"}</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {description ?? "This feature is included in the Pro and Business plans."}
        </p>
        <Button asChild>
          <Link to="/pricing">View plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}