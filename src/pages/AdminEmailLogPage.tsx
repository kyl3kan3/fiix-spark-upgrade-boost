import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";
import { format } from "date-fns";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface NotifRow {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  provider_message_id: string | null;
  event_type: string | null;
  reference_id: string | null;
}
interface EventRow {
  id: string;
  provider_message_id: string;
  event_type: string;
  recipient_email: string | null;
  occurred_at: string;
}

function statusVariant(t: string): "default" | "secondary" | "destructive" | "outline" {
  if (t.includes("bounce") || t.includes("complain") || t.includes("fail")) return "destructive";
  if (t.includes("deliver")) return "default";
  if (t.includes("open") || t.includes("click")) return "secondary";
  return "outline";
}

const AdminEmailLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get("message_id");
  const { isAdminUser: isAdmin, isLoading: adminLoading } = useAdminStatus();
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle("Email Delivery Log | MaintenEase");

  const load = async () => {
    setLoading(true);
    const { data: n } = await supabase
      .from("notifications")
      .select("id, title, created_at, user_id, provider_message_id, event_type, reference_id")
      .eq("type", "email")
      .not("provider_message_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (n as NotifRow[]) || [];
    setNotifs(rows);
    const ids = rows.map(r => r.provider_message_id).filter(Boolean) as string[];
    if (ids.length) {
      const { data: ev } = await supabase
        .from("email_events")
        .select("id, provider_message_id, event_type, recipient_email, occurred_at")
        .in("provider_message_id", ids)
        .order("occurred_at", { ascending: false });
      setEvents((ev as EventRow[]) || []);
    } else {
      setEvents([]);
    }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const eventsByMsg = useMemo(() => {
    const m = new Map<string, EventRow[]>();
    events.forEach(e => {
      const arr = m.get(e.provider_message_id) || [];
      arr.push(e);
      m.set(e.provider_message_id, arr);
    });
    return m;
  }, [events]);

  if (adminLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></DashboardLayout>;
  }
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Admins only</h1>
          <p className="text-muted-foreground mb-4">This page contains sensitive delivery data.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      
      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-5 w-5" /> Email Delivery Log</h1>
            <p className="text-sm text-muted-foreground">Resend events for emails sent from your workspace.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : notifs.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No emails sent yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {notifs.map(n => {
              const evts = eventsByMsg.get(n.provider_message_id || "") || [];
              const isFocused = focusId && focusId === n.provider_message_id;
              return (
                <Card key={n.id} className={isFocused ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="text-base">{n.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sent {format(new Date(n.created_at), "MMM d, yyyy p")} ·{" "}
                          <span className="font-mono">{n.provider_message_id}</span>
                        </p>
                      </div>
                      {n.event_type && <Badge variant="outline" className="text-xs">{n.event_type}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {evts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No webhook events received yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {evts.map(e => (
                          <li key={e.id} className="flex items-center gap-2 text-sm">
                            <Badge variant={statusVariant(e.event_type)} className="capitalize">
                              {e.event_type.replace(/^email\./, "")}
                            </Badge>
                            <span className="text-muted-foreground">
                              {format(new Date(e.occurred_at), "MMM d, p")}
                            </span>
                            {e.recipient_email && (
                              <span className="text-xs text-muted-foreground">→ {e.recipient_email}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminEmailLogPage;