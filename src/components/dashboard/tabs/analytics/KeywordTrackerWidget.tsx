import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Row {
  database: string;
  keyword?: string;
  volume?: number;
  cpc?: number;
  competition?: number;
  difficulty?: number;
  error?: string;
}

const FLAGS: Record<string, string> = {
  us: "🇺🇸", uk: "🇬🇧", au: "🇦🇺", ca: "🇨🇦", de: "🇩🇪", in: "🇮🇳",
  fr: "🇫🇷", es: "🇪🇸", br: "🇧🇷", it: "🇮🇹", nl: "🇳🇱", se: "🇸🇪",
};

const NAMES: Record<string, string> = {
  us: "United States", uk: "United Kingdom", au: "Australia", ca: "Canada",
  de: "Germany", in: "India", fr: "France", es: "Spain", br: "Brazil",
  it: "Italy", nl: "Netherlands", se: "Sweden",
};

const DEFAULT_KEYWORD = "maintenance software";
const DEFAULT_DBS = ["us", "uk", "au", "ca", "de", "in"];

const KeywordTrackerWidget = () => {
  const [keyword, setKeyword] = useState(DEFAULT_KEYWORD);
  const [input, setInput] = useState(DEFAULT_KEYWORD);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const fetchData = async (kw: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("semrush-keyword-tracker", {
        body: { keyword: kw, databases: DEFAULT_DBS },
      });
      if (error) throw error;
      setRows((data?.results ?? []) as Row[]);
      setFetchedAt(data?.fetched_at ?? null);
      setKeyword(kw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keyword data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(DEFAULT_KEYWORD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxVolume = Math.max(1, ...rows.map((r) => r.volume ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO keyword tracker</CardTitle>
        <CardDescription>
          Monthly search volume, CPC, and difficulty across markets — powered by Semrush.
          {fetchedAt && ` Updated ${new Date(fetchedAt).toLocaleString()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            const kw = input.trim();
            if (kw) fetchData(kw);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Keyword to track"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </form>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : rows.length === 0 && loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs text-muted-foreground px-2">
              <div className="col-span-4">Market</div>
              <div className="col-span-4 text-right">Volume / mo</div>
              <div className="col-span-2 text-right">CPC</div>
              <div className="col-span-2 text-right">KDI</div>
            </div>
            {rows
              .slice()
              .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
              .map((r) => {
                const pct = ((r.volume ?? 0) / maxVolume) * 100;
                return (
                  <div key={r.database} className="px-2 py-2 rounded hover:bg-muted/50">
                    <div className="grid grid-cols-12 items-center text-sm">
                      <div className="col-span-4 flex items-center gap-2">
                        <span>{FLAGS[r.database] ?? "🏳️"}</span>
                        <span>{NAMES[r.database] ?? r.database.toUpperCase()}</span>
                      </div>
                      <div className="col-span-4 text-right font-mono">
                        {r.error ? <span className="text-destructive text-xs">{r.error}</span> : (r.volume ?? 0).toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right font-mono text-muted-foreground">
                        {r.error ? "—" : `$${(r.cpc ?? 0).toFixed(2)}`}
                      </div>
                      <div className="col-span-2 text-right font-mono text-muted-foreground">
                        {r.error ? "—" : r.difficulty ?? 0}
                      </div>
                    </div>
                    {!r.error && (
                      <div className="h-1.5 rounded bg-muted overflow-hidden mt-1.5">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Tracking "{keyword}". Data from Semrush, organic Google only.
        </p>
      </CardContent>
    </Card>
  );
};

export default KeywordTrackerWidget;