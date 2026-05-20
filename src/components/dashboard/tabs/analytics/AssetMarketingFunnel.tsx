import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PAGES = [
 { slug: "asset-tracking-software", label: "Asset Tracking" },
 { slug: "asset-management-software", label: "Asset Management" },
];

const FUNNEL_STEPS = [
 { key: "page_view", label: "Page view" },
 { key: "lead_form_view", label: "Lead form view" },
 { key: "lead_submit", label: "Lead submit" },
] as const;

type Row = { event_type: string; page_slug: string };

const AssetMarketingFunnel = () => {
 const [counts, setCounts] = useState<Record<string, Record<string, number>>>({});
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 let cancelled = false;
 (async () => {
 const { data, error } = await supabase
 .from("marketing_page_events")
 .select("event_type,page_slug")
 .in("page_slug", PAGES.map((p) => p.slug))
 .in("event_type", FUNNEL_STEPS.map((s) => s.key))
 .limit(10000);
 if (cancelled) return;
 if (error) {
 setError(error.message);
 setLoading(false);
 return;
 }
 const agg: Record<string, Record<string, number>> = {};
 for (const p of PAGES) {
 agg[p.slug] = Object.fromEntries(FUNNEL_STEPS.map((s) => [s.key, 0]));
 }
 (data as Row[] | null)?.forEach((r) => {
 if (agg[r.page_slug] && agg[r.page_slug][r.event_type] !== undefined) {
 agg[r.page_slug][r.event_type] += 1;
 }
 });
 setCounts(agg);
 setLoading(false);
 })();
 return () => {
 cancelled = true;
 };
 }, []);

 return (
 <Card>
 <CardHeader>
 <CardTitle>Asset pages funnel</CardTitle>
 <CardDescription>Page view → lead form view → lead submit, per asset solution page.</CardDescription>
 </CardHeader>
 <CardContent>
 {loading ? (
 <p className="text-sm text-muted-foreground">Loading…</p>
 ) : error ? (
 <p className="text-sm text-muted-foreground">
 Funnel data is available to administrators only.
 </p>
 ) : (
 <div className="grid gap-6 md:grid-cols-2">
 {PAGES.map((page) => {
 const c = counts[page.slug] ?? {};
 const top = c[FUNNEL_STEPS[0].key] || 0;
 return (
 <div key={page.slug}>
 <h4 className="font-medium mb-3">{page.label}</h4>
 <div className="space-y-2">
 {FUNNEL_STEPS.map((step) => {
 const value = c[step.key] || 0;
 const pct = top > 0 ? Math.round((value / top) * 100) : 0;
 return (
 <div key={step.key}>
 <div className="flex justify-between text-sm mb-1">
 <span>{step.label}</span>
 <span className="font-mono">{value}{top > 0 ? ` · ${pct}%` : ""}</span>
 </div>
 <div className="h-2 rounded bg-muted overflow-hidden">
 <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </CardContent>
 </Card>
 );
};

export default AssetMarketingFunnel;