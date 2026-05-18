import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Users, Package, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { format } from "date-fns";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";

export default function BillingPage() {
  const { data: sub, isLoading, refetch } = useSubscription();
  const [params] = useSearchParams();
  const [opening, setOpening] = useState(false);
  const [counts, setCounts] = useState<{ assets: number; workOrders: number; seats: number }>({ assets: 0, workOrders: 0, seats: 0 });

  useEffect(() => {
    if (params.get("success") === "1") {
      toast.success("Subscription started — welcome!");
      // Refetch after a beat to let webhook land
      setTimeout(() => refetch(), 2000);
    }
  }, [params, refetch]);

  useEffect(() => {
    (async () => {
      const [{ count: assets }, { count: workOrders }, { count: seats }] = await Promise.all([
        supabase.from("assets").select("*", { count: "exact", head: true }),
        supabase.from("work_orders").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ assets: assets ?? 0, workOrders: workOrders ?? 0, seats: seats ?? 0 });
    })();
  }, []);

  async function openPortal() {
    setOpening(true);
    try {
      const { data, error } = await supabase.functions.invoke("paddle-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      toast.error((e as Error).message || "Could not open billing portal");
    } finally {
      setOpening(false);
    }
  }

  if (isLoading) return <div className="container mx-auto p-8">Loading…</div>;

  const noSubscription = !sub;

  return (
    <div>
      <PaymentTestModeBanner />
      <div className="container mx-auto max-w-5xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
      <p className="mt-1 text-muted-foreground">Manage your subscription, seats, and invoices.</p>

      {noSubscription ? (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">You don't have an active subscription yet.</p>
            <Button asChild><Link to="/pricing">Choose a plan</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{sub.tier} plan</CardTitle>
                <Badge variant={sub.status === "active" ? "default" : sub.status === "trialing" ? "secondary" : "destructive"}>
                  {sub.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Billing</div>
                  <div className="font-medium capitalize">{sub.billing_interval}ly</div>
                </div>
                {sub.trial_ends_at && sub.status === "trialing" && (
                  <div>
                    <div className="text-muted-foreground">Trial ends</div>
                    <div className="font-medium">{format(new Date(sub.trial_ends_at), "MMM d, yyyy")}</div>
                  </div>
                )}
                {sub.current_period_end && (
                  <div>
                    <div className="text-muted-foreground">Next billing date</div>
                    <div className="font-medium">{format(new Date(sub.current_period_end), "MMM d, yyyy")}</div>
                  </div>
                )}
                {sub.cancel_at_period_end && (
                  <div className="col-span-2 rounded bg-destructive/10 p-2 text-destructive">
                    Subscription will cancel at the end of the current period.
                  </div>
                )}
              </div>
              <Button onClick={openPortal} disabled={opening}>
                {opening ? "Opening…" : <>Manage subscription <ExternalLink className="ml-2 h-4 w-4" /></>}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <UsageCard
              icon={<Users className="h-4 w-4" />}
              label="Seats"
              used={counts.seats}
              limit={sub.total_seats}
              hint={`${sub.included_seats} included + ${sub.paid_seats} extra`}
            />
            <UsageCard
              icon={<Package className="h-4 w-4" />}
              label="Assets"
              used={counts.assets}
              limit={sub.asset_limit}
            />
            <UsageCard
              icon={<ClipboardList className="h-4 w-4" />}
              label="Work orders this month"
              used={counts.workOrders}
              limit={sub.work_order_limit}
            />
          </div>
        </>
      )}
      </div>
    </div>
  );
}

function UsageCard({ icon, label, used, limit, hint }: { icon: React.ReactNode; label: string; used: number; limit: number | null; hint?: string }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}{label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{used}<span className="text-base font-normal text-muted-foreground"> / {limit ?? "∞"}</span></div>
        {limit !== null && <Progress value={pct} className="h-2" />}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}