import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NotifRow {
 id: string;
 title: string;
 body: string;
 created_at: string;
 provider_message_id: string | null;
 event_type: string | null;
}
interface EventRow {
 id: string;
 provider_message_id: string;
 event_type: string;
 recipient_email: string | null;
 occurred_at: string;
}

function statusVariant(t: string): "default" | "secondary" | "destructive" | "outline" {
 if (t.includes("bounce") || t.includes("complain") || t.includes("fail") || t.includes("suppress")) return "destructive";
 if (t.includes("deliver")) return "default";
 if (t.includes("open") || t.includes("click")) return "secondary";
 return "outline";
}

function latestStatus(events: EventRow[]): string {
 if (!events.length) return "sent";
 const order = ["complained", "bounced", "suppressed", "opened", "clicked", "delivered", "sent"];
 for (const s of order) {
 if (events.find(e => e.event_type.includes(s))) return s;
 }
 return events[0].event_type.replace(/^email\./, "");
}

const MyEmailLogPage: React.FC = () => {
 const navigate = useNavigate();
 const [notifs, setNotifs] = useState<NotifRow[]>([]);
 const [events, setEvents] = useState<EventRow[]>([]);
 const [loading, setLoading] = useState(true);

 const load = async () => {
 setLoading(true);
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) { navigate("/auth"); return; }

 const { data: n } = await supabase
 .from("notifications")
 .select("id, title, body, created_at, provider_message_id, event_type")
 .eq("user_id", user.id)
 .eq("type", "email")
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

 useEffect(() => { load(); }, []);

 const eventsByMsg = useMemo(() => {
 const m = new Map<string, EventRow[]>();
 events.forEach(e => {
 const arr = m.get(e.provider_message_id) || [];
 arr.push(e);
 m.set(e.provider_message_id, arr);
 });
 return m;
 }, [events]);

 return (
 <DashboardLayout>
 <Helmet>
 <title>My Email Log | MaintenEase</title>
 <meta name="description" content="Track delivery status for notification emails sent to you by MaintenEase, including assignments, status changes, and weather alerts." />
 <link rel="canonical" href="https://maintenease.com/notifications/email-log" />
 </Helmet>
 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-4">
 <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="-ml-2">
 <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
 </Button>
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-5 w-5" /> My Email Log</h1>
 <p className="text-sm text-muted-foreground">Delivery status for emails sent to you.</p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" onClick={() => navigate("/settings/notifications")}>
 Preferences
 </Button>
 <Button variant="outline" size="sm" onClick={load}>
 <RefreshCw className="h-4 w-4 mr-1" /> Refresh
 </Button>
 </div>
 </div>

 {loading ? (
 <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
 ) : notifs.length === 0 ? (
 <Card><CardContent className="py-10 text-center text-muted-foreground">No emails sent to you yet.</CardContent></Card>
 ) : (
 <div className="space-y-3">
 {notifs.map(n => {
 const evts = eventsByMsg.get(n.provider_message_id || "") || [];
 const status = latestStatus(evts);
 return (
 <Card key={n.id}>
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div className="min-w-0">
 <CardTitle className="text-base">{n.title}</CardTitle>
 <p className="text-xs text-muted-foreground mt-0.5">
 Sent {format(new Date(n.created_at), "MMM d, yyyy p")}
 </p>
 </div>
 <Badge variant={statusVariant(status)} className="capitalize">{status}</Badge>
 </div>
 </CardHeader>
 <CardContent>
 {n.body && <p className="text-sm text-muted-foreground mb-2">{n.body}</p>}
 {evts.length === 0 ? (
 <p className="text-xs text-muted-foreground">No delivery events received yet.</p>
 ) : (
 <ul className="space-y-1.5">
 {evts.map(e => (
 <li key={e.id} className="flex items-center gap-2 text-sm">
 <Badge variant={statusVariant(e.event_type)} className="capitalize">
 {e.event_type.replace(/^email\./, "")}
 </Badge>
 <span className="text-muted-foreground text-xs">
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

export default MyEmailLogPage;