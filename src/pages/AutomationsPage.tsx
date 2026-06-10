import React, { useEffect, useState } from "react";
import { Zap, Loader2, Plus, Pencil } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageContainer from "@/components/shell/PageContainer";
import {
  listRecurringChecklists,
  type RecurringChecklistSummary,
} from "@/services/checklistService";

const AutomationsPage: React.FC = () => {
  const [items, setItems] = useState<RecurringChecklistSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await listRecurringChecklists());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <PageContainer className="space-y-8">
        <BackToDashboard />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
              <Zap className="h-8 w-8" />
              Automations
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Recurring checklists and scheduled work that runs automatically.
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold shadow-sm">
            <Link to="/checklists/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Link>
          </Button>
        </div>

        <PaywallGate
          feature="automations"
          title="Automations is a Pro feature"
          description="Upgrade to Pro or Business to schedule recurring checklists, automated reminders, and routine work."
        >
          <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-headline text-xl text-foreground">
                Recurring Checklists
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Checklists that repeat on a schedule. Manage them from the Checklists page.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No recurring checklists yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a recurring checklist to automate your facility operations.
                    </p>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold">
                    <Link to="/checklists/new">Create a recurring checklist</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 group hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/checklists/${it.id}`}
                              className="font-semibold text-foreground hover:text-primary hover:underline truncate block transition-colors"
                            >
                              {it.name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Next due:{" "}
                              {it.schedule?.next_due_at
                                ? new Date(it.schedule.next_due_at).toLocaleString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-11 sm:ml-0">
                        <Badge
                          variant="secondary"
                          className="capitalize rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-0"
                        >
                          {it.frequency || "scheduled"}
                        </Badge>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link to={`/checklists/${it.id}`} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </PaywallGate>
      </PageContainer>
    </DashboardLayout>
  );
};

export default AutomationsPage;
