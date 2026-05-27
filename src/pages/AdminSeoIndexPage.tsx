import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";
import { solutions } from "@/data/solutions";
import { glossary } from "@/data/glossary";

const SITE_ORIGIN = "https://maintenease.com";

const STATIC_URLS = [
 "/",
 "/pricing",
 "/solutions",
 "/learn",
 "/privacy",
 "/terms",
 "/refund-policy",
];

function buildAllUrls(): string[] {
 const dynamic = [
 ...solutions.map((s) => `/solutions/${s.slug}`),
 ...glossary.map((g) => `/learn/${g.slug}`),
 ];
 return [...STATIC_URLS, ...dynamic].map((p) => `${SITE_ORIGIN}${p}`);
}

interface InspectResult {
 url: string;
 coverageState?: string;
 indexingState?: string;
 verdict?: string;
 lastCrawlTime?: string | null;
 pageFetchState?: string;
 robotsTxtState?: string;
 googleCanonical?: string | null;
 userCanonical?: string | null;
 inspectionResultLink?: string;
 error?: string;
}

function verdictBadge(v?: string, hasError?: boolean) {
 if (hasError) return <Badge variant="destructive">Error</Badge>;
 switch (v) {
 case "PASS":
 return <Badge className="bg-emerald-600 hover:bg-emerald-600">Indexed</Badge>;
 case "PARTIAL":
 return <Badge className="bg-amber-500 hover:bg-amber-500">Partial</Badge>;
 case "FAIL":
 return <Badge variant="destructive">Not indexed</Badge>;
 case "NEUTRAL":
 return <Badge variant="secondary">Unknown</Badge>;
 default:
 return <Badge variant="outline">{v ?? "—"}</Badge>;
 }
}

const AdminSeoIndexPage: React.FC = () => {
 const navigate = useNavigate();
 const { isAdminUser, isLoading: roleLoading } = useAdminStatus();
 const [loading, setLoading] = useState(false);
 const [results, setResults] = useState<InspectResult[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [filter, setFilter] = useState("");
 const [showOnlyUnindexed, setShowOnlyUnindexed] = useState(false);
 const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

 const allUrls = useMemo(() => buildAllUrls(), []);

 const runScan = async () => {
 setLoading(true);
 setError(null);
 try {
 const { data, error: invokeErr } = await supabase.functions.invoke("seo-index-status", {
 body: { urls: allUrls },
 });
 if (invokeErr) throw invokeErr;
 const next: InspectResult[] = data?.results ?? [];
 setResults(next);
 setLastRunAt(new Date());
 } catch (e) {
 const msg = e instanceof Error ? e.message : String(e);
 setError(msg);
 } finally {
 setLoading(false);
 }
 };

 const filtered = useMemo(() => {
 let rows = results;
 if (filter.trim()) {
 const q = filter.toLowerCase();
 rows = rows.filter((r) => r.url.toLowerCase().includes(q));
 }
 if (showOnlyUnindexed) {
 rows = rows.filter((r) => r.error || (r.verdict && r.verdict !== "PASS"));
 }
 return rows;
 }, [results, filter, showOnlyUnindexed]);

 const stats = useMemo(() => {
 let indexed = 0;
 let notIndexed = 0;
 let errors = 0;
 for (const r of results) {
 if (r.error) errors++;
 else if (r.verdict === "PASS") indexed++;
 else notIndexed++;
 }
 return { total: results.length, indexed, notIndexed, errors };
 }, [results]);

 if (roleLoading) {
 return (
 <DashboardLayout>
 <div className="flex items-center justify-center py-20">
 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
 </div>
 </DashboardLayout>
 );
 }

 if (!isAdminUser) {
 return (
 <DashboardLayout>
 <div className="container mx-auto max-w-3xl px-4 py-10">
 <p className="text-foreground">You need administrator access to view the SEO index tracker.</p>
 </div>
 </DashboardLayout>
 );
 }

 return (
 <DashboardLayout>
 <Helmet>
 <title>SEO Index Tracker — MaintenEase Admin</title>
 <meta name="robots" content="noindex,nofollow" />
 </Helmet>
 <div className="container mx-auto max-w-6xl px-4 py-8">
 <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-3">
 <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
 </Button>
 <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">SEO Index Tracker</h1>
 <p className="mt-1 text-sm text-foreground">
 Live indexing status from Google Search Console for every marketing URL.
 {lastRunAt && (
 <span className="ml-2 text-muted-foreground">Last scan: {lastRunAt.toLocaleString()}</span>
 )}
 </p>
 </div>
 <Button onClick={runScan} disabled={loading}>
 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
 {results.length ? "Re-scan" : "Run scan"}
 </Button>
 </div>

 <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
 <StatCard label="Total URLs" value={allUrls.length} />
 <StatCard label="Indexed" value={stats.indexed} tone="emerald" />
 <StatCard label="Not indexed" value={stats.notIndexed} tone="amber" />
 <StatCard label="Errors" value={stats.errors} tone="red" />
 </div>

 {error && (
 <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
 {error}
 </div>
 )}

 <Card>
 <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
 <CardTitle>URL status</CardTitle>
 <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2">
 <div className="relative w-full sm:w-auto">
 <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 value={filter}
 onChange={(e) => setFilter(e.target.value)}
 placeholder="Filter URLs"
 className="h-9 w-full sm:w-56 pl-8"
 />
 </div>
 <label className="flex items-center gap-2 text-sm text-foreground">
 <input
 type="checkbox"
 checked={showOnlyUnindexed}
 onChange={(e) => setShowOnlyUnindexed(e.target.checked)}
 />
 Only show not-indexed
 </label>
 </div>
 </CardHeader>
 <CardContent className="overflow-x-auto p-0">
 {results.length === 0 && !loading && (
 <div className="px-6 py-10 text-center text-sm text-muted-foreground">
 Click <strong>Run scan</strong> to query Google Search Console for every marketing URL.
 </div>
 )}
 {results.length > 0 && (
 <table className="w-full min-w-[760px] text-sm">
 <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
 <tr>
 <th className="px-4 py-2">URL</th>
 <th className="px-4 py-2">Status</th>
 <th className="px-4 py-2">Coverage</th>
 <th className="px-4 py-2">Last crawl</th>
 <th className="px-4 py-2">Details</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((r) => (
 <tr key={r.url} className="border-t border-border align-top">
 <td className="px-4 py-3 font-mono text-xs text-foreground">
 {r.url.replace(SITE_ORIGIN, "") || "/"}
 </td>
 <td className="px-4 py-3">{verdictBadge(r.verdict, !!r.error)}</td>
 <td className="px-4 py-3 text-foreground">{r.coverageState ?? "—"}</td>
 <td className="px-4 py-3 text-foreground">
 {r.lastCrawlTime ? new Date(r.lastCrawlTime).toLocaleDateString() : "—"}
 </td>
 <td className="px-4 py-3 text-foreground">
 {r.error ? (
 <span className="text-red-600">{r.error}</span>
 ) : r.inspectionResultLink ? (
 <a
 href={r.inspectionResultLink}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1 text-maintenease-600 hover:underline"
 >
 Open in GSC <ExternalLink className="h-3 w-3" />
 </a>
 ) : (
 "—"
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </CardContent>
 </Card>
 </div>
 </DashboardLayout>
 );
};

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "amber" | "red" }) {
 const toneClass =
 tone === "emerald"
 ? "text-emerald-700"
 : tone === "amber"
 ? "text-amber-700"
 : tone === "red"
 ? "text-red-700"
 : "text-foreground";
 return (
 <Card>
 <CardContent className="p-4">
 <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
 <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
 </CardContent>
 </Card>
 );
}

export default AdminSeoIndexPage;
