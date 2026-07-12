import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Campaign { id: number | string; name?: string; url?: string; database?: string; keywords_count?: number; }

const PositionTrackingWidget = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id?: string | number) => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("semrush-position-tracking", {
        body: id ? { campaign_id: id } : {},
      });
      if (error) throw error;
      const list: Campaign[] = Array.isArray(data?.campaigns) ? data.campaigns : (data?.campaigns?.data ?? []);
      setCampaigns(list);
      if (data?.overview) setDetail(data.overview);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Position Tracking campaigns</CardTitle>
          <CardDescription>Semrush Projects → Position Tracking. Create a campaign in Semrush; it appears here.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {campaigns.length === 0 && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            No Position Tracking campaigns found on the connected Semrush account. Create one in Semrush → Projects → Position Tracking to see it here.
          </p>
        )}
        {campaigns.length > 0 && (
          <div className="space-y-1">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); load(c.id); }}
                className={`w-full text-left grid grid-cols-12 items-center text-sm px-2 py-2 rounded hover:bg-muted/50 ${selected?.id === c.id ? "bg-muted" : ""}`}
              >
                <div className="col-span-6 font-medium truncate">{c.name ?? c.url ?? `Campaign ${c.id}`}</div>
                <div className="col-span-3 text-xs text-muted-foreground truncate">{c.url}</div>
                <div className="col-span-2 text-xs uppercase text-muted-foreground">{c.database ?? "—"}</div>
                <div className="col-span-1 text-right text-xs font-mono">{c.keywords_count ?? "—"}</div>
              </button>
            ))}
          </div>
        )}

        {detail && selected && (
          <div className="rounded-md border p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Organic overview · {selected.name ?? selected.id}</div>
            <pre className="text-xs overflow-x-auto">{JSON.stringify(detail, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionTrackingWidget;
