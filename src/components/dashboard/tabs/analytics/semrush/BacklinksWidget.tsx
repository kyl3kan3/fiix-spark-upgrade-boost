import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Overview {
  authorityScore: number; totalBacklinks: number; referringDomains: number;
  referringUrls: number; referringIps: number; follows: number; nofollows: number;
  error?: string;
}
interface Ref { domain: string; authorityScore: number; backlinks: number; country: string; firstSeen: string | null; lastSeen: string | null; }

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-md border p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-xl font-semibold font-mono">{typeof value === "number" ? value.toLocaleString() : value}</div>
  </div>
);

const BacklinksWidget = () => {
  const [target, setTarget] = useState("maintenease.com");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [refs, setRefs] = useState<Ref[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("semrush-backlinks", {
        body: { target, target_type: "root_domain" },
      });
      if (error) throw error;
      setOverview(data?.overview ?? null);
      setRefs(data?.referring_domains?.rows ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backlinks overview</CardTitle>
        <CardDescription>Authority Score, referring domains, and top referrers from Semrush.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Domain (e.g. example.com)" disabled={loading} />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {overview?.error && <p className="text-sm text-destructive">{overview.error}</p>}

        {overview && !overview.error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat label="Authority Score" value={overview.authorityScore} />
            <Stat label="Referring domains" value={overview.referringDomains} />
            <Stat label="Total backlinks" value={overview.totalBacklinks} />
            <Stat label="Follow links" value={overview.follows} />
          </div>
        )}

        {refs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Top referring domains</h4>
            <div className="space-y-1">
              {refs.map((r) => (
                <div key={r.domain} className="grid grid-cols-12 items-center text-sm px-2 py-1.5 rounded hover:bg-muted/50">
                  <div className="col-span-6 truncate">{r.domain}</div>
                  <div className="col-span-2 text-right font-mono text-xs text-muted-foreground">AS {r.authorityScore}</div>
                  <div className="col-span-2 text-right font-mono">{r.backlinks.toLocaleString()}</div>
                  <div className="col-span-2 text-right text-xs text-muted-foreground uppercase">{r.country || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BacklinksWidget;