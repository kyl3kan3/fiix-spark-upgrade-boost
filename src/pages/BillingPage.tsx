import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  Rocket,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import { useAuth } from "@/hooks/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchaseConversion } from "@/lib/gtag";

const billingHistoryRows = [
  {
    date: "Sep 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
  {
    date: "Aug 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
  {
    date: "Jul 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
];

export default function BillingPage() {
  const { data: sub, isLoading, refetch } = useSubscription();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [opening, setOpening] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [seatDelta, setSeatDelta] = useState(1);
  const [seatSaving, setSeatSaving] = useState(false);
  const [counts, setCounts] = useState<{
    assets: number;
    workOrders: number;
    seats: number;
  }>({
    assets: 0,
    workOrders: 0,
    seats: 0,
  });

  useEffect(() => {
    if (params.get("success") === "1") {
      toast.success("Subscription started — welcome!");
      trackPurchaseConversion({
        transactionId: params.get("transaction_id") || params.get("_ptxn") || "",
        email: user?.email ?? null,
      });
      setTimeout(() => refetch(), 2000);
    }
  }, [params, refetch, user?.email]);

  useEffect(() => {
    const fetchUsageCounts = async () => {
      const [{ count: assets }, { count: workOrders }, { count: seats }] =
        await Promise.all([
          supabase.from("assets").select("*", { count: "exact", head: true }),
          supabase
            .from("work_orders")
            .select("*", { count: "exact", head: true })
            .gte(
              "created_at",
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ).toISOString(),
            ),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

      setCounts({
        assets: assets ?? 0,
        workOrders: workOrders ?? 0,
        seats: seats ?? 0,
      });
    };

    void fetchUsageCounts();
  }, []);

  async function openPortal() {
    setOpening(true);
    const popup = window.open("about:blank", "_blank");

    try {
      const { data, error } = await supabase.functions.invoke("paddle-portal");
      if (error) throw error;

      if (data?.url) {
        if (popup) popup.location.href = data.url;
        else window.open(data.url, "_blank");
      } else {
        popup?.close();
      }
    } catch (error) {
      popup?.close();
      toast.error((error as Error).message || "Could not open billing portal");
    } finally {
      setOpening(false);
    }
  }

  async function submitAddSeats() {
    if (!sub) return;

    const additional = Math.max(0, Math.floor(seatDelta));
    const newTotal = sub.paid_seats + additional;
    setSeatSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke("update-seats", {
        body: { extraSeats: newTotal },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }

      toast.success(
        `Added ${additional} seat${additional === 1 ? "" : "s"}. Charges are prorated.`,
      );
      setSeatsOpen(false);
      setSeatDelta(1);
      setTimeout(() => refetch(), 1500);
    } catch (error) {
      toast.error((error as Error).message || "Could not update seats");
    } finally {
      setSeatSaving(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  const noSubscription = !sub;

  return (
    <DashboardLayout>
      <PaymentTestModeBanner />
      <PageContainer className="space-y-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/5 -ml-2"
        >
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div>
          <h1 className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Billing &amp; Subscription
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage your MaintenEase workspace plan, payment methods, and usage.
          </p>
        </div>

        {noSubscription ? (
          <div className="bg-card border border-border rounded-lg shadow-sm p-12 text-center">
            <p className="mb-4 text-muted-foreground">
              You don't have an active subscription yet.
            </p>
            <Button
              asChild
              className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold"
            >
              <Link to="/pricing">Choose a plan</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-card border border-transparent rounded-xl shadow-sm hover:shadow-md hover:border-primary/10 transition-all overflow-hidden flex flex-col relative">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                        Current Plan
                      </span>
                      <h2 className="font-headline text-2xl font-semibold text-foreground flex items-center gap-2 capitalize">
                        {sub.tier} Plan
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        Billed {sub.billing_interval}ly
                      </p>
                    </div>
                    <div className="text-right">
                      {sub.current_period_end && (
                        <>
                          <p className="text-xs text-muted-foreground mb-1">
                            Next billing date
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {format(new Date(sub.current_period_end), "MMM d, yyyy")}
                          </p>
                        </>
                      )}
                      <Badge
                        variant={
                          sub.status === "active"
                            ? "default"
                            : sub.status === "trialing"
                              ? "secondary"
                              : "destructive"
                        }
                        className="mt-2 capitalize"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>

                  {sub.trial_ends_at && sub.status === "trialing" && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Trial ends{" "}
                      <span className="font-semibold text-foreground">
                        {format(new Date(sub.trial_ends_at), "MMM d, yyyy")}
                      </span>
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    <UsageMetric
                      icon={<Users className="h-4 w-4" />}
                      label="Active Users"
                      used={counts.seats}
                      limit={sub.total_seats}
                      hint={`${sub.included_seats} included + ${sub.paid_seats} extra`}
                    />
                    <UsageMetric
                      icon={<Package className="h-4 w-4" />}
                      label="Managed Assets"
                      used={counts.assets}
                      limit={sub.asset_limit}
                    />
                    <UsageMetric
                      icon={<ClipboardList className="h-4 w-4" />}
                      label="Work Orders"
                      used={counts.workOrders}
                      limit={sub.work_order_limit}
                    />
                  </div>

                  {sub.cancel_at_period_end && (
                    <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      Subscription will cancel at the end of the current period.
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-border/70 bg-background/50 backdrop-blur-sm flex flex-wrap gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSeatsOpen(true)}
                    className="border-border text-primary hover:bg-primary/5"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add seats ($15/seat/mo)
                  </Button>
                  <Button
                    onClick={openPortal}
                    disabled={opening}
                    className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold"
                  >
                    {opening ? (
                      "Opening…"
                    ) : (
                      <>
                        Manage subscription
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-6 flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6 border border-white/20 backdrop-blur-md">
                    <Rocket className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-2">
                    Scale with Enterprise
                  </h3>
                  <p className="text-sm text-primary-foreground/80 mb-5">
                    Unlock unlimited assets, advanced API access, and dedicated
                    24/7 support.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited Managed Assets",
                      "Custom Reporting Dashboards",
                      "SSO & Advanced Security",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary-foreground/70" />
                        <span className="text-primary-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  asChild
                  className="relative z-10 w-full bg-white text-primary hover:bg-white/90 uppercase tracking-wide text-xs font-semibold"
                >
                  <Link to="/pricing">View Enterprise Plans</Link>
                </Button>
              </div>
            </div>

            <BillingSupportGrid />
          </>
        )}
      </PageContainer>

      {sub && (
        <Dialog open={seatsOpen} onOpenChange={setSeatsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add seats</DialogTitle>
              <DialogDescription>
                Extra seats are $15/seat/
                {sub.billing_interval === "year" ? "year" : "month"}. You'll
                be charged a prorated amount immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="text-sm text-muted-foreground">
                Currently: {" "}
                <span className="font-medium text-foreground">
                  {sub.total_seats} total seats
                </span>{" "}
                ({sub.included_seats} included + {sub.paid_seats} extra)
              </div>
              <div className="space-y-2">
                <Label htmlFor="seat-delta">Seats to add</Label>
                <Input
                  id="seat-delta"
                  type="number"
                  min={1}
                  max={500 - sub.paid_seats}
                  value={seatDelta}
                  onChange={(event) =>
                    setSeatDelta(
                      Math.max(1, parseInt(event.target.value || "1", 10)),
                    )
                  }
                />
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                New total: {" "}
                <span className="font-semibold">
                  {sub.total_seats + Math.max(0, seatDelta)} seats
                </span>{" "}
                · +${15 * Math.max(0, seatDelta)}/
                {sub.billing_interval === "year" ? "yr" : "mo"} prorated
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSeatsOpen(false)}
                disabled={seatSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={submitAddSeats}
                disabled={seatSaving || seatDelta < 1}
                className="bg-primary hover:bg-primary-variant text-primary-foreground"
              >
                {seatSaving
                  ? "Adding…"
                  : `Add ${seatDelta} seat${seatDelta === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

function BillingSupportGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-1 bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-colors duration-300 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-semibold text-foreground">
            Payment Method
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/5"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="bg-muted/40 rounded-lg p-4 border border-border/60 flex items-center gap-4 mb-4">
          <div className="w-12 h-8 bg-white rounded border border-border/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <span className="text-[#1434CB] font-bold italic text-xs tracking-tighter">
              VISA
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 12/2025</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
            Default
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-auto w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </section>

      <section className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-colors duration-300 overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-border/70 flex justify-between items-center">
          <h3 className="font-headline text-xl font-semibold text-foreground">
            Billing History
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/5"
          >
            Download All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {billingHistoryRows.map((invoice) => (
                <tr key={invoice.date} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-6 text-sm text-foreground">{invoice.date}</td>
                  <td className="py-4 px-4 text-sm text-foreground">{invoice.description}</td>
                  <td className="py-4 px-4 text-sm text-foreground font-medium">{invoice.amount}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ReceiptText className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border/50 bg-background/50 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
          >
            View Older Invoices
          </Button>
        </div>
      </section>
    </div>
  );
}

function UsageMetric({
  icon,
  label,
  used,
  limit,
  hint,
}: {
  icon: ReactNode;
  label: string;
  used: number;
  limit: number | null;
  hint?: string;
}) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="bg-muted/40 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="font-headline text-2xl font-semibold text-foreground leading-none">
          {used}
        </span>
        <span className="text-sm text-muted-foreground leading-none pb-0.5">
          / {limit ?? "∞"}
        </span>
      </div>
      {limit !== null && (
        <Progress
          value={pct}
          className={`h-1.5 ${isHigh ? "[&>div]:bg-warning" : "[&>div]:bg-primary"}`}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}
