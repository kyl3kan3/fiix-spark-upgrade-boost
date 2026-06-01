import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PaywallGate } from "@/components/billing/PaywallGate";
import MaterialIcon from "@/components/ui/material-icon";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

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
      <Helmet>
        <title>Automations | MaintenEase</title>
        <meta name="description" content="Manage automated rules and recurring checklists to streamline facility operations." />
        <link rel="canonical" href="https://maintenease.com/automations" />
      </Helmet>

      <main className="flex-1 overflow-y-auto p-4 md:p-container_padding pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header & Global Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-on-surface mb-2">Workflow Builder</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Manage automated rules to streamline facility operations.</p>
            </div>
            <Link
              to="/checklists/new"
              className="bg-primary text-on-primary font-label-md text-label-md uppercase px-6 py-4 rounded-DEFAULT shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-200 flex items-center gap-2"
            >
              <MaterialIcon name="account_tree" />
              Create New Automation
            </Link>
          </div>

          <PaywallGate
            feature="automations"
            title="Automations is a Pro feature"
            description="Upgrade to Pro or Business to schedule recurring checklists, automated reminders, and routine work."
          >
            {/* Active Automations List */}
            <div className="space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-2">Active Rules</h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : items.length > 0 ? (
                items.map((it) => (
                  <div key={it.id} className="bg-surface-container-lowest rounded-lg p-card_padding border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-200 group flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0 pt-1">
                      <div className="relative inline-block w-12 mr-2 align-middle select-none">
                        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">{it.name}</h3>
                        <span className="bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase px-2 py-1 rounded-sm font-bold capitalize">{it.frequency || "Scheduled"}</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Next due: {it.schedule?.next_due_at ? new Date(it.schedule.next_due_at).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0">
                      <Link to={`/checklists/${it.id}`} className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors" title="Edit">
                        <MaterialIcon name="edit" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Mockup Rule Card 1 */}
                  <div className="bg-surface-container-lowest rounded-lg p-card_padding border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-200 group flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0 pt-1">
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <div className="w-12 h-6 bg-primary rounded-full relative">
                          <div className="absolute right-1 top-0.5 w-5 h-5 bg-white rounded-full shadow border-4 border-primary"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Escalate High Priority Work Orders</h3>
                        <span className="bg-error-container text-on-error-container font-label-sm text-label-sm uppercase px-2 py-1 rounded-sm font-bold">Critical</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded-md border border-outline-variant/10">
                        <span className="font-semibold text-primary">IF</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="assignment" className="text-sm" /> Work Order
                        </span>
                        <span>Priority is</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm text-error font-medium">High</span>
                        <span className="font-semibold text-primary ml-2">THEN</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="notifications_active" className="text-sm" /> Notify
                        </span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">Facility Manager</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0">
                      <button className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors" title="Edit">
                        <MaterialIcon name="edit" />
                      </button>
                      <button className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-colors" title="Delete">
                        <MaterialIcon name="delete" />
                      </button>
                    </div>
                  </div>

                  {/* Mockup Rule Card 2 */}
                  <div className="bg-surface-container-lowest rounded-lg p-card_padding border border-transparent hover:border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-200 group flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0 pt-1">
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <div className="w-12 h-6 bg-primary rounded-full relative">
                          <div className="absolute right-1 top-0.5 w-5 h-5 bg-white rounded-full shadow border-4 border-primary"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Auto-Assign Preventive Maintenance</h3>
                        <span className="bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase px-2 py-1 rounded-sm font-bold">Routine</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-3 rounded-md border border-outline-variant/10">
                        <span className="font-semibold text-primary">IF</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="inventory_2" className="text-sm" /> Asset Category
                        </span>
                        <span>is</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">HVAC</span>
                        <span>AND</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="schedule" className="text-sm" /> Type
                        </span>
                        <span>is</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">Preventive</span>
                        <span className="font-semibold text-primary ml-2">THEN</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="person_add" className="text-sm" /> Assign To
                        </span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">HVAC Tech Team</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0">
                      <button className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors" title="Edit">
                        <MaterialIcon name="edit" />
                      </button>
                      <button className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-colors" title="Delete">
                        <MaterialIcon name="delete" />
                      </button>
                    </div>
                  </div>

                  {/* Mockup Rule Card 3 (Inactive) */}
                  <div className="bg-surface-container-lowest/50 rounded-lg p-card_padding border border-transparent hover:border-primary/10 shadow-[0_4px_10px_rgba(0,0,0,0.02)] transition-all duration-200 group flex flex-col md:flex-row gap-6 items-start md:items-center opacity-75">
                    <div className="flex-shrink-0 pt-1">
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <div className="w-12 h-6 bg-outline-variant rounded-full relative">
                          <div className="absolute left-1 top-0.5 w-5 h-5 bg-white rounded-full shadow border-4 border-outline-variant"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface-variant">Low Inventory Alert</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 font-body-md text-body-md text-outline bg-surface/50 p-3 rounded-md border border-outline-variant/10">
                        <span className="font-semibold text-on-surface-variant">IF</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="build_circle" className="text-sm" /> Part Stock
                        </span>
                        <span>drops below</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">Minimum Threshold</span>
                        <span className="font-semibold text-on-surface-variant ml-2">THEN</span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm flex items-center gap-1">
                          <MaterialIcon name="shopping_cart" className="text-sm" /> Create
                        </span>
                        <span className="bg-surface rounded px-2 py-1 border border-outline-variant/20 shadow-sm">Purchase Request</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-outline-variant/10 pt-4 md:pt-0">
                      <button className="text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors" title="Edit">
                        <MaterialIcon name="edit" />
                      </button>
                      <button className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-colors" title="Delete">
                        <MaterialIcon name="delete" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </PaywallGate>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default AutomationsPage;
