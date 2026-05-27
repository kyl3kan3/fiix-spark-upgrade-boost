import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Link2, Unlink, MousePointerClick, Eye, DollarSign, Target, Users, Upload } from "lucide-react";
import { toast } from "sonner";

type Campaign = {
  id: string; name: string; status: string;
  impressions: number; clicks: number; cost: number;
  conversions: number; ctr: number; avg_cpc: number;
};
type Metrics = {
  connected: boolean;
  customer_id?: string | null;
  account_name?: string | null;
  connected_at?: string;
  totals?: { impressions: number; clicks: number; cost: number; conversions: number };
  campaigns?: Campaign[];
  error?: unknown;
};

const fmtMoney = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtNum = (n: number) => n.toLocaleString();

const GoogleAdsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [data, setData] = useState<Metrics | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ads-metrics", { method: "POST" });
      if (error) throw error;
      setData(data as Metrics);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Google Ads metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-ads-oauth-start", { method: "POST" });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No OAuth URL returned");
      window.open(url, "_blank", "width=600,height=700");
      toast.message("Complete authorization in the new tab, then click Refresh.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Could not start OAuth: ${msg}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google Ads? You'll need to re-authorize to reconnect.")) return;
    try {
      await supabase.functions.invoke("google-ads-disconnect", { method: "POST" });
      toast.success("Disconnected");
      load();
    } catch (e) {
      toast.error("Failed to disconnect");
    }
  };

  const syncAudience = async (segment: "all_users" | "trial_users" | "paying_users" | "churned_users") => {
    setSyncing(segment);
    try {
      const { data, error } = await supabase.functions.invoke("google-ads-audience-sync", {
        method: "POST",
        body: { segment },
      });
      if (error) throw error;
      const r = data as { emails_count?: number; list_name?: string; error?: string };
      if (r?.error) throw new Error(r.error);
      toast.success(`Synced ${r.emails_count ?? 0} users → "${r.list_name}"`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Audience sync failed: ${msg}`);
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Google Ads</CardTitle>
          {data?.connected && data.customer_id && (
            <div className="text-xs text-muted-foreground mt-1">
              Account {data.customer_id}{data.account_name ? ` · ${data.account_name}` : ""} · last 30 days
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
          {data?.connected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Unlink className="h-3.5 w-3.5 mr-1" /> Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={connect} disabled={connecting}>
              {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Link2 className="h-3.5 w-3.5 mr-1" />}
              Connect Google Ads
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !data?.connected ? (
          <p className="text-sm text-muted-foreground">
            Connect your Google Ads account to surface spend, clicks, impressions, and conversions here.
          </p>
        ) : data.error ? (
          <div className="text-sm">
            <p className="text-destructive font-medium mb-2">Google Ads API returned an error:</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">{JSON.stringify(data.error, null, 2)}</pre>
            <p className="text-xs text-muted-foreground mt-2">Common causes: developer token not approved for production, or the account isn't accessible from the connected Google login.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Kpi icon={DollarSign} label="Spend" value={fmtMoney(data.totals?.cost ?? 0)} />
              <Kpi icon={MousePointerClick} label="Clicks" value={fmtNum(data.totals?.clicks ?? 0)} />
              <Kpi icon={Eye} label="Impressions" value={fmtNum(data.totals?.impressions ?? 0)} />
              <Kpi icon={Target} label="Conversions" value={fmtNum(Math.round(data.totals?.conversions ?? 0))} />
            </div>
            {data.campaigns && data.campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Campaign</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Impr.</th>
                      <th className="px-3 py-2 text-right">Clicks</th>
                      <th className="px-3 py-2 text-right">CTR</th>
                      <th className="px-3 py-2 text-right">Avg CPC</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c) => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{c.status}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(c.impressions)}</td>
                        <td className="px-3 py-2 text-right">{fmtNum(c.clicks)}</td>
                        <td className="px-3 py-2 text-right">{(c.ctr * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right">{fmtMoney(c.avg_cpc)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmtMoney(c.cost)}</td>
                        <td className="px-3 py-2 text-right">{c.conversions.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No campaign activity in the last 30 days.</p>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Customer-match audiences</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Push hashed user emails to Google Ads as remarketing lists. Lists auto-create on first sync.
              </p>
              <div className="flex flex-wrap gap-2">
                {(["all_users", "trial_users", "paying_users", "churned_users"] as const).map((seg) => (
                  <Button
                    key={seg}
                    size="sm"
                    variant="outline"
                    disabled={syncing !== null}
                    onClick={() => syncAudience(seg)}
                  >
                    {syncing === seg ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 mr-1" />
                    )}
                    {seg.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

function Kpi({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default GoogleAdsPanel;