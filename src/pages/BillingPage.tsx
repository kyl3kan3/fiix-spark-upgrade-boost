import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users, Package, ClipboardList, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { format } from "date-fns";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import { trackPurchaseConversion } from "@/lib/gtag";
import { useAuth } from "@/hooks/auth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MaterialIcon from "@/components/ui/material-icon";
import { Helmet } from "react-helmet-async";

export default function BillingPage() {
  const { data: sub, isLoading, refetch } = useSubscription();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [opening, setOpening] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [seatDelta, setSeatDelta] = useState(1);
  const [seatSaving, setSeatSaving] = useState(false);
  const [counts, setCounts] = useState<{ assets: number; workOrders: number; seats: number }>({
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
    (async () => {
      const [{ count: assets }, { count: workOrders }, { count: seats }] = await Promise.all([
        supabase.from("assets").select("*", { count: "exact", head: true }),
        supabase
          .from("work_orders")
          .select("*", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          ),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ assets: assets ?? 0, workOrders: workOrders ?? 0, seats: seats ?? 0 });
    })();
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
    } catch (e) {
      popup?.close();
      toast.error((e as Error).message || "Could not open billing portal");
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
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Added ${additional} seat${additional === 1 ? "" : "s"}. Charges are prorated.`);
      setSeatsOpen(false);
      setSeatDelta(1);
      setTimeout(() => refetch(), 1500);
    } catch (e) {
      toast.error((e as Error).message || "Could not update seats");
    } finally {
      setSeatSaving(false);
    }
  }

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-on-surface-variant">Loading…</div>
      </DashboardLayout>
    );

  const noSubscription = !sub;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Billing & Subscription | MaintenEase</title>
        <meta name="description" content="Manage your MaintenEase workspace plan, payment methods, and billing history." />
        <link rel="canonical" href="https://maintenease.com/billing" />
      </Helmet>
      <PaymentTestModeBanner />

      <div className="max-w-6xl mx-auto px-gutter md:px-container_padding py-8">
        <header className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Billing &amp; Subscription</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your MaintenEase workspace plan, payment methods, and billing history.</p>
        </header>

        {noSubscription ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10 p-12 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">You don't have an active subscription yet.</p>
            <Link to="/pricing" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm">
              Choose a plan
            </Link>
          </div>
        ) : (
          <>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Plan Card (Spans 2 columns on desktop) */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-transparent hover:border-primary/10 transition-colors duration-300 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-surface-variant/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="p-card_padding flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-flex items-center px-2 py-1 rounded bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2">Current Plan</div>
                      <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 capitalize">
                        {sub.tier} Plan
                        <MaterialIcon name="verified" className="text-primary text-[20px]" filled />
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 capitalize">
                        Billed {sub.billing_interval}ly
                      </p>
                    </div>
                    <div className="text-right">
                      {sub.current_period_end && (
                        <>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Next billing date</p>
                          <p className="font-body-md text-body-md font-medium text-on-surface">
                            {format(new Date(sub.current_period_end), "MMM d, yyyy")}
                          </p>
                        </>
                      )}
                      <Badge
                        variant={sub.status === "active" ? "default" : sub.status === "trialing" ? "secondary" : "destructive"}
                        className="mt-2 capitalize"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>

                  {sub.trial_ends_at && sub.status === "trialing" && (
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      Trial ends <span className="font-semibold text-on-surface">{format(new Date(sub.trial_ends_at), "MMM d, yyyy")}</span>
                    </p>
                  )}

                  {/* Usage Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-surface-container-low rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Active Users</span>
                        <MaterialIcon name="group" className="text-outline text-[18px]" />
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="font-headline-md text-headline-md text-on-surface leading-none">{counts.seats}</span>
                        <span className="font-body-md text-body-md text-on-surface-variant leading-none pb-0.5">/ {sub.total_seats ?? "∞"}</span>
                      </div>
                      <div className="w-full bg-secondary-fixed rounded-full h-1.5 mt-3">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${sub.total_seats ? Math.min(100, (counts.seats / sub.total_seats) * 100) : 0}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Managed Assets</span>
                        <MaterialIcon name="precision_manufacturing" className="text-outline text-[18px]" />
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="font-headline-md text-headline-md text-on-surface leading-none">{counts.assets}</span>
                        <span className="font-body-md text-body-md text-on-surface-variant leading-none pb-0.5">/ {sub.asset_limit ?? "∞"}</span>
                      </div>
                      <div className="w-full bg-secondary-fixed rounded-full h-1.5 mt-3">
                        <div className={`h-1.5 rounded-full ${sub.asset_limit && counts.assets / sub.asset_limit >= 0.8 ? "bg-warning" : "bg-primary"}`} style={{ width: `${sub.asset_limit ? Math.min(100, (counts.assets / sub.asset_limit) * 100) : 0}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {sub.cancel_at_period_end && (
                    <div className="mt-4 rounded-lg bg-error-container p-3 font-body-md text-body-md text-on-error-container">
                      Subscription will cancel at the end of the current period.
                    </div>
                  )}
                </div>
                {/* Quick Action Footer */}
                <div className="px-card_padding py-4 border-t border-outline-variant/20 bg-surface/50 backdrop-blur-sm flex justify-end gap-3 z-10">
                  <button className="font-label-md text-label-md text-primary hover:underline px-4 py-2">
                    Cancel Plan
                  </button>
                  <button
                    onClick={() => setSeatsOpen(true)}
                    className="bg-surface-container-high text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-variant transition-colors"
                  >
                    Manage Users
                  </button>
                  <Button
                    onClick={openPortal}
                    disabled={opening}
                    className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wide rounded-lg shadow-sm"
                  >
                    {opening ? "Opening…" : (
                      <>Manage subscription <ExternalLink className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>

              {/* Upgrade CTA Card */}
              <div className="bg-primary text-on-primary rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.08)] p-card_padding flex flex-col justify-between relative overflow-hidden transform transition-transform hover:-translate-y-1 duration-300">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                    <MaterialIcon name="rocket_launch" className="text-on-primary text-[24px]" />
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">Scale with Enterprise</h3>
                  <p className="font-body-md text-body-md text-on-primary/80 mb-6">Unlock unlimited assets, advanced API access, and dedicated 24/7 support.</p>
                  <ul className="space-y-3 mb-8">
                    {["Unlimited Managed Assets", "Custom Reporting Dashboards", "SSO & Advanced Security"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <MaterialIcon name="check_circle" className="text-[18px] text-surface-container-high mt-0.5" />
                        <span className="font-body-md text-body-md text-on-primary/90 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/pricing" className="relative z-10 w-full bg-on-primary text-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:bg-surface-container-low transition-colors uppercase tracking-wide text-center block">
                  View Enterprise Plans
                </Link>
              </div>
            </div>

            {/* Lower Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Method */}
              <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-transparent hover:border-primary/10 transition-colors duration-300 p-card_padding flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[20px]">Payment Method</h3>
                  <button className="text-primary hover:bg-primary/5 p-1 rounded transition-colors">
                    <MaterialIcon name="edit" className="text-[20px]" />
                  </button>
                </div>
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 flex items-center gap-4 mb-4">
                  <div className="w-12 h-8 bg-white rounded border border-outline-variant/50 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                    <div className="text-[#1434CB] font-bold italic text-xs tracking-tighter">VISA</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-body-md text-body-md font-medium text-on-surface">•••• •••• •••• 4242</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Expires 12/2025</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">Default</span>
                </div>
                <button className="mt-auto flex items-center justify-center gap-2 w-full py-2 border border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-label-md text-label-md">
                  <MaterialIcon name="add" className="text-[18px]" />
                  Add Payment Method
                </button>
              </div>

              {/* Billing History */}
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-transparent hover:border-primary/10 transition-colors duration-300 overflow-hidden flex flex-col">
                <div className="px-card_padding pt-card_padding pb-4 border-b border-outline-variant/20 flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[20px]">Billing History</h3>
                  <button className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1">
                    <MaterialIcon name="download" className="text-[18px]" />
                    Download All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/30">
                        <th className="py-3 px-card_padding font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Description</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Amount</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Status</th>
                        <th className="py-3 px-card_padding font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wider text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {[
                        { date: "Sep 15, 2023" },
                        { date: "Aug 15, 2023" },
                        { date: "Jul 15, 2023" },
                      ].map((row) => (
                        <tr key={row.date} className="hover:bg-surface-container-low/50 transition-colors group">
                          <td className="py-4 px-card_padding font-body-md text-body-md text-on-surface">{row.date}</td>
                          <td className="py-4 px-4 font-body-md text-body-md text-on-surface capitalize">{sub.tier} Tier (Monthly)</td>
                          <td className="py-4 px-4 font-body-md text-body-md text-on-surface font-medium">—</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success font-label-sm text-label-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                              Paid
                            </span>
                          </td>
                          <td className="py-4 px-card_padding text-right">
                            <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                              <MaterialIcon name="receipt_long" className="text-[20px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-card_padding py-3 border-t border-outline-variant/10 bg-surface/50 text-center">
                  <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                    View Older Invoices
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {sub && (
        <Dialog open={seatsOpen} onOpenChange={setSeatsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add seats</DialogTitle>
              <DialogDescription>
                Extra seats are $15/seat/{sub.billing_interval === "year" ? "year" : "month"}. You'll be charged a prorated amount immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="text-sm text-on-surface-variant">
                Currently: <span className="font-medium text-on-surface">{sub.total_seats} total seats</span> ({sub.included_seats} included + {sub.paid_seats} extra)
              </div>
              <div className="space-y-2">
                <Label htmlFor="seat-delta">Seats to add</Label>
                <Input
                  id="seat-delta"
                  type="number"
                  min={1}
                  max={500 - sub.paid_seats}
                  value={seatDelta}
                  onChange={(e) => setSeatDelta(Math.max(1, parseInt(e.target.value || "1", 10)))}
                />
              </div>
              <div className="rounded-md bg-surface-container-low px-3 py-2 font-body-md text-body-md">
                New total: <span className="font-semibold">{sub.total_seats + Math.max(0, seatDelta)} seats</span> · +${15 * Math.max(0, seatDelta)}/{sub.billing_interval === "year" ? "yr" : "mo"} prorated
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSeatsOpen(false)} disabled={seatSaving}>Cancel</Button>
              <Button onClick={submitAddSeats} disabled={seatSaving || seatDelta < 1} className="bg-primary hover:bg-primary-container text-on-primary">
                {seatSaving ? "Adding…" : `Add ${seatDelta} seat${seatDelta === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
