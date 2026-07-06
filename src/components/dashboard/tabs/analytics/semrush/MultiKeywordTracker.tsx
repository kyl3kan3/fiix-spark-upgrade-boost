import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Row { keyword: string; volume: number; cpc: number; difficulty: number; competition: number; error?: string; }

const DEFAULTS = "maintenance software, cmms software, facility management software, work order software, preventive maintenance software";

const MultiKeywordTracker = () => {
  const [input, setInput] = useState(DEFAULTS);
  const [database, setDatabase] = useState("us");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    const keywords = input.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 15);
    try {
      const results = await Promise.all(keywords.map(async (kw): Promise<Row> => {
        const { data, error } = await supabase.functions.invoke("semrush-keyword-tracker", {
          body: { keyword: kw, databases: [database] },
        });
        if (error) return { keyword: kw, volume: 0, cpc: 0, difficulty: 0, competition: 0, error: error.message };
        const r = data?.results?.[0];
        if (!r || r.error) return { keyword: kw, volume: 0, cpc: 0, difficulty: 0, competition: 0, error: r?.error ?? "no data" };
        return { keyword: kw, volume: r.volume ?? 0, cpc: r.cpc ?? 0, difficulty: r.difficulty ?? 0, competition: r.competition ?? 0 };
      }));
      setRows(results.sort((a, b) => b.volume - a.volume));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  };

  const maxVolume = Math.max(1, ...rows.map((r) => r.volume));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-keyword tracker</CardTitle>
        <CardDescription>Track multiple keywords in one market — volume, CPC, and difficulty from Semrush.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-2 mb-4" onSubmit={(e) => { e.preventDefault(); fetchAll(); }}>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Comma-separated keywords" disabled={loading} />
          <div className="flex gap-2">
            <Input value={database} onChange={(e) => setDatabase(e.target.value.toLowerCase().slice(0, 5))} placeholder="Database (us, uk, de…)" className="max-w-[200px]" disabled={loading} />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Fetch</span>
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs text-muted-foreground px-2">
              <div className="col-span-5">Keyword</div>
              <div className="col-span-3 text-right">Volume / mo</div>
              <div className="col-span-2 text-right">CPC</div>
              <div className="col-span-2 text-right">KDI</div>
            </div>
            {rows.map((r) => {
              const pct = (r.volume / maxVolume) * 100;
              return (
                <div key={r.keyword} className="px-2 py-2 rounded hover:bg-muted/50">
                  <div className="grid grid-cols-12 items-center text-sm">
                    <div className="col-span-5 truncate">{r.keyword}</div>
                    <div className="col-span-3 text-right font-mono">
                      {r.error ? <span className="text-destructive text-xs">{r.error}</span> : r.volume.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right font-mono text-muted-foreground">{r.error ? "—" : `$${r.cpc.toFixed(2)}`}</div>
                    <div className="col-span-2 text-right font-mono text-muted-foreground">{r.error ? "—" : r.difficulty}</div>
                  </div>
                  {!r.error && <div className="h-1.5 rounded bg-muted overflow-hidden mt-1.5"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiKeywordTracker;