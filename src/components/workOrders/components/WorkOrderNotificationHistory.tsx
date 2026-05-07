import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Mail, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  event_type: string | null;
  created_at: string;
  provider_message_id: string | null;
}

function eventLabel(type: string | null) {
  switch (type) {
    case "wo_assigned": return "Assigned";
    case "wo_status_changed": return "Status changed";
    case "wo_due_soon": return "Due soon";
    case "wo_overdue": return "Overdue";
    default: return type || "Event";
  }
}

function NotificationListBody({ workOrderId }: { workOrderId: string }) {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, type, event_type, created_at, provider_message_id")
        .eq("reference_id", workOrderId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (mounted) {
        setRows((data as NotificationRow[]) || []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [workOrderId]);

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No notifications triggered yet.</p>;
  }

  return (
    <ul className="divide-y">
      {rows.map(n => (
        <li key={n.id} className="py-3 flex items-start gap-3">
          <div className="mt-0.5">
            {n.type === "email" ? <Mail className="h-4 w-4 text-muted-foreground" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{eventLabel(n.event_type)}</Badge>
              <Badge variant="outline" className="text-xs capitalize">{n.type}</Badge>
              <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "MMM d, p")}</span>
            </div>
            <p className="text-sm font-medium mt-1 truncate">{n.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
            {n.type === "email" && n.provider_message_id && (
              <Link
                to={`/admin/email-log?message_id=${encodeURIComponent(n.provider_message_id)}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                View email events <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WorkOrderNotificationHistoryCard({ workOrderId }: { workOrderId: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notification history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationListBody workOrderId={workOrderId} />
      </CardContent>
    </Card>
  );
}

export function WorkOrderNotificationHistoryDrawer({ workOrderId }: { workOrderId: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-1" /> Notifications
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notification history</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NotificationListBody workOrderId={workOrderId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}