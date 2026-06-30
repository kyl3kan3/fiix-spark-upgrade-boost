import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, RefreshCw, Link2, Unlink, Users, Activity, Eye, Target, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Property = { id: string; displayName: string; account: string };
type Totals = {
  activeUsers: number; sessions: number; pageViews: number;
  conversions: number; engagementRate: number; avgSessionDuration: number;
};
type Metrics = {
  connected: boolean;
  property_id?: string | null;
  property_display_name?: string | null;
  account_display_name?: string | null;
  connected_at?: string;
  properties?: Property[];
  totals?: Totals;
  timeseries?: { date: string; activeUsers: number; sessions: number }[];
  topPages?: { path: string; views: number; users: number }[];
  topSources?: { channel: string; sessions: number; users: number; conversions: number }[];
  error?: unknown;
};

const fmtNum = (n: number) => Math.round(n).toLocaleString();
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60); const sec = Math.round(s % 60);
  return `${m}m ${sec}s`;
};

const GoogleAnalyticsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [data, setData] = useState<Metrics | null>(null);
  const [switching, setSwitching] = useState(false);

  const load = async (property_id?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-analytics-metrics", {
        method: "POST",
        body: property_id ? { property_id } : {},
      });
      if (error) throw error;
      setData(data as Metrics);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Google Analytics metrics");
    } finally {
      setLoading(false);
      setSwitching(false);
    }
  };

  useEffect(() => { load(); }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-analytics-oauth-start", { method: "POST" });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No OAuth URL returned");
      window.open(url, "_blank", "width=600,height=700");
      toast.message("Authorize in the new tab, then click Refresh.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Could not start OAuth: ${msg}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google Analytics?")) return;
    try {
      await supabase.functions.invoke("google-analytics-disconnect", { method: "POST" });
      toast.success("Disconnected");
      load();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const switchProperty = (id: string) => {
    setSwitching(true);
    load(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Google Analytics (GA4)</CardTitle>
          {data?.connected && data.property_display_name && (
            <div className="text-xs text-muted-foreground mt-1">
              {data.account_display_name ? `${data.account_display_name} · ` : ""}
              {data.property_display_name} · last 30 days
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
          {data?.connected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Unlink className="h-3.5 w-3.5 mr-1" /> Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={connect} disabled={connecting}>
              {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Link2 className="h-3.5 w-3.5 mr-1" />}
              Connect Google Analytics
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !data?.connected ? (
          <p className="text-sm text-muted-foreground">
            Connect a Google account that has access to your GA4 property to pull live sessions, users, top pages, and channels here.
          </p>
        ) : (
          <>
            {data.properties && data.properties.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Property:</span>
                <Select value={data.property_id ?? ""} onValueChange={switchProperty} disabled={switching}>
                  <SelectTrigger className="h-8 w-[320px] text-xs">
                    <SelectValue placeholder="Select a GA4 property" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.properties.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.account} — {p.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {switching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
            )}

            {data.error ? (
              <div className="text-sm">
                <p className="text-destructive font-medium mb-2">GA4 returned an error or no data:</p>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">{typeof data.error === "string" ? data.error : JSON.stringify(data.error, null, 2)}</pre>
              </div>
            ) : data.totals ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Kpi icon={Users} label="Active users" value={fmtNum(data.totals.activeUsers)} />
                  <Kpi icon={Activity} label="Sessions" value={fmtNum(data.totals.sessions)} />
                  <Kpi icon={Eye} label="Page views" value={fmtNum(data.totals.pageViews)} />
                  <Kpi icon={Target} label="Conversions" value={fmtNum(data.totals.conversions)} />
                  <Kpi icon={BarChart3} label="Engagement rate" value={fmtPct(data.totals.engagementRate)} />
                  <Kpi icon={Activity} label="Avg session" value={fmtDuration(data.totals.avgSessionDuration)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Top pages</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left">Path</th>
                            <th className="px-3 py-2 text-right">Views</th>
                            <th className="px-3 py-2 text-right">Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.topPages ?? []).map((p) => (
                            <tr key={p.path} className="border-t border-border">
                              <td className="px-3 py-2 truncate max-w-[260px]">{p.path}</td>
                              <td className="px-3 py-2 text-right">{fmtNum(p.views)}</td>
                              <td className="px-3 py-2 text-right">{fmtNum(p.users)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Top channels</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left">Channel</th>
                            <th className="px-3 py-2 text-right">Sessions</th>
                            <th className="px-3 py-2 text-right">Users</th>
                            <th className="px-3 py-2 text-right">Conv.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.topSources ?? []).map((s) => (
                            <tr key={s.channel} className="border-t border-border">
                              <td className="px-3 py-2">{s.channel}</td>
                              <td className="px-3 py-2 text-right">{fmtNum(s.sessions)}</td>
                              <td className="px-3 py-2 text-right">{fmtNum(s.users)}</td>
                              <td className="px-3 py-2 text-right">{fmtNum(s.conversions)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a GA4 property above to load metrics.</p>
            )}
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

export default GoogleAnalyticsPanel;