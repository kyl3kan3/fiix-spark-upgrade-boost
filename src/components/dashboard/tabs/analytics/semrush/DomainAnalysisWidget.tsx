import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface DomainRow {
  domain: string; rank?: number; organicKeywords?: number; organicTraffic?: number;
  organicCost?: number; adwordsKeywords?: number; adwordsTraffic?: number; error?: string;
}
interface Competitor { domain: string; competitionLevel: number; commonKeywords: number; organicKeywords: number; organicTraffic: number; }

const DomainAnalysisWidget = () => {
  const [domain, setDomain] = useState("maintenease.com");
  const [competitors, setCompetitors] = useState("upkeep.com, limblecmms.com, maintainx.com");
  const [database, setDatabase] = useState("us");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<DomainRow | null>(null);
  const [comparison, setComparison] = useState<DomainRow[]>([]);
  const [discovered, setDiscovered] = useState<Competitor[]>([]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const compList = competitors.split(",").map((c) => c.trim()).filter(Boolean).slice(0, 5);
      const { data, error } = await supabase.functions.invoke("semrush-domain-analysis", {
        body: { domain, database, competitors: compList },
      });
      if (error) throw error;
      setMe(data?.domain ?? null);
      setComparison(data?.comparison ?? []);
      setDiscovered(data?.competitors?.competitors ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const fmt = (n?: number) => (n ?? 0).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain & competitor analysis</CardTitle>
        <CardDescription>Organic traffic, keywords, and paid visibility across your site and named competitors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Your domain" disabled={loading} />
          <Input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Competitors (comma-separated)" className="md:col-span-2" disabled={loading} />
          <div className="flex gap-2">
            <Input value={database} onChange={(e) => setDatabase(e.target.value.toLowerCase().slice(0, 5))} placeholder="us" disabled={loading} />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {(me || comparison.length > 0) && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground text-right">
                  <th className="text-left py-2">Domain</th>
                  <th>Organic KW</th>
                  <th>Organic traffic</th>
                  <th>Traffic cost</th>
                  <th>Paid KW</th>
                  <th>Paid traffic</th>
                </tr>
              </thead>
              <tbody>
                {[me, ...comparison].filter(Boolean).map((r, i) => (
                  <tr key={`${r!.domain}-${i}`} className={`border-t ${i === 0 ? "font-semibold" : ""}`}>
                    <td className="py-2">{r!.domain}</td>
                    {r!.error ? (
                      <td colSpan={5} className="text-right text-destructive text-xs">{r!.error}</td>
                    ) : (
                      <>
                        <td className="text-right font-mono">{fmt(r!.organicKeywords)}</td>
                        <td className="text-right font-mono">{fmt(r!.organicTraffic)}</td>
                        <td className="text-right font-mono">${fmt(r!.organicCost)}</td>
                        <td className="text-right font-mono">{fmt(r!.adwordsKeywords)}</td>
                        <td className="text-right font-mono">{fmt(r!.adwordsTraffic)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {discovered.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Semrush-discovered competitors</h4>
            <div className="space-y-1">
              {discovered.map((c) => (
                <div key={c.domain} className="flex justify-between text-sm px-2 py-1 rounded hover:bg-muted/50">
                  <span>{c.domain}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {c.commonKeywords.toLocaleString()} shared · {c.organicTraffic.toLocaleString()} traffic
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainAnalysisWidget;