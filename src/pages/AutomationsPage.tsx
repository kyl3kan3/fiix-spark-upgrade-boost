import React, { useEffect, useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledChecklist {
  id: string;
  name: string;
  frequency: string | null;
  schedule?: { next_due_at: string | null; last_submitted_at: string | null } | null;
}

const AutomationsPage: React.FC = () => {
  const [items, setItems] = useState<ScheduledChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("checklists")
        .select("id, name, frequency, checklist_schedules(next_due_at, last_submitted_at)")
        .eq("is_active", true)
        .neq("frequency", "one-time")
        .order("name");
      setItems(
        (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          frequency: c.frequency,
          schedule: c.checklist_schedules?.[0] || null,
        }))
      );
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <BackToDashboard />
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
            Automations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Recurring checklists and scheduled work that runs automatically.
          </p>
        </div>

        <PaywallGate
          feature="automations"
          title="Automations is a Pro feature"
          description="Upgrade to Pro or Business to schedule recurring checklists, automated reminders, and routine work."
        >
          <Card>
            <CardHeader>
              <CardTitle>Recurring Checklists</CardTitle>
              <CardDescription>
                Checklists that repeat on a schedule. Manage them from the Checklists page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-muted-foreground">No recurring checklists yet.</p>
                  <Button asChild>
                    <Link to="/checklists/new">Create a recurring checklist</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <Link
                          to={`/checklists/${it.id}`}
                          className="font-medium hover:underline truncate block"
                        >
                          {it.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Next due:{" "}
                          {it.schedule?.next_due_at
                            ? new Date(it.schedule.next_due_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {it.frequency || "scheduled"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </PaywallGate>
      </div>
    </DashboardLayout>
  );
};

export default AutomationsPage;