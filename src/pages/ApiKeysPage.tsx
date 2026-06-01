import React, { useEffect, useState } from "react";
import { Loader2, Copy } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MaterialIcon from "@/components/ui/material-icon";
import { Helmet } from "react-helmet-async";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/[+/=]/g, "")
    .slice(0, 40);
  return `mke_live_${b64}`;
}

const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setKeys((data || []) as ApiKey[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setCreating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.company_id) throw new Error("No company");

      const fullKey = generateKey();
      const key_hash = await sha256(fullKey);
      const key_prefix = fullKey.slice(0, 16);

      const { error } = await supabase.from("api_keys").insert({
        company_id: profile.company_id,
        created_by: user.id,
        name: name.trim(),
        key_hash,
        key_prefix,
      });
      if (error) throw error;
      setNewKey(fullKey);
      setName("");
      fetchKeys();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? It will stop working immediately.")) return;
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Key revoked");
      fetchKeys();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this key?")) return;
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) toast.error(error.message);
    else fetchKeys();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>API & Integrations | MaintenEase</title>
        <meta name="description" content="Manage API keys, webhooks, and connect MaintenEase with your enterprise ecosystem." />
        <link rel="canonical" href="https://maintenease.com/api-keys" />
      </Helmet>

      <div className="flex-1 p-gutter md:p-container_padding overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">API &amp; Integrations</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Manage your API keys, configure webhooks, and connect MaintenEase with your existing enterprise ecosystem for seamless data flow.
            </p>
          </div>

          <PaywallGate
            feature="api"
            title="API access is a Business feature"
            description="Upgrade to Business to generate API keys and integrate MaintenEase with your other systems."
          >
            {/* API Keys & Documentation Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* API Keys Card (Spans 2 columns on desktop) */}
              <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:border-primary/10 hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                    <MaterialIcon name="key" className="text-primary" />
                    Active API Keys
                  </h2>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !name.trim()}
                    className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MaterialIcon name="add" className="text-sm" />}
                    Generate Key
                  </button>
                </div>

                {/* Create form */}
                <div className="flex flex-col sm:flex-row gap-2 p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="keyName" className="sr-only">Name</Label>
                    <input
                      id="keyName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Integration name (e.g. Zapier integration)"
                      className="w-full bg-surface border-none rounded px-3 py-2 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:outline-none text-on-surface placeholder:text-outline"
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded uppercase tracking-wider hover:bg-primary-container transition-colors disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : null}
                    Create key
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
                    </div>
                  ) : keys.length === 0 ? (
                    <>
                      {/* Mockup Key Items */}
                      <div className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group">
                        <div>
                          <div className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                            Production Data Sync
                            <span className="bg-success/20 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                          </div>
                          <div className="font-body-md text-body-md text-on-surface-variant mt-1 font-mono text-sm">sk_live_593...a2f9</div>
                          <div className="font-label-sm text-label-sm text-outline mt-1">Last used: Today, 08:42 AM</div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant">
                            <MaterialIcon name="content_copy" className="text-base" />
                          </button>
                          <button className="p-2 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error-container">
                            <MaterialIcon name="delete" className="text-base" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group">
                        <div>
                          <div className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                            Staging Environment
                            <span className="bg-warning/20 text-warning px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Testing</span>
                          </div>
                          <div className="font-body-md text-body-md text-on-surface-variant mt-1 font-mono text-sm">sk_test_112...b7c4</div>
                          <div className="font-label-sm text-label-sm text-outline mt-1">Last used: Oct 24, 2023</div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-variant">
                            <MaterialIcon name="content_copy" className="text-base" />
                          </button>
                          <button className="p-2 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error-container">
                            <MaterialIcon name="delete" className="text-base" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    keys.map((k) => (
                      <div key={k.id} className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group">
                        <div>
                          <div className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                            {k.name}
                            {k.revoked_at ? (
                              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Revoked</span>
                            ) : (
                              <span className="bg-success/20 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                            )}
                          </div>
                          <div className="font-body-md text-body-md text-on-surface-variant mt-1 font-mono text-sm">{k.key_prefix}…</div>
                          <div className="font-label-sm text-label-sm text-outline mt-1">
                            Created {new Date(k.created_at).toLocaleDateString()}
                            {k.last_used_at ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}` : " · Never used"}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!k.revoked_at && (
                            <button
                              onClick={() => handleRevoke(k.id)}
                              className="px-3 py-1.5 text-primary hover:bg-primary/5 border border-primary/30 rounded font-label-sm uppercase tracking-wider transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error-container"
                          >
                            <MaterialIcon name="delete" className="text-base" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Documentation Card */}
              <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:border-primary/10 hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-surface-variant/30 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 mb-4">
                    <MaterialIcon name="menu_book" className="text-primary" />
                    Developer Docs
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">Explore our comprehensive guides, endpoints, and SDKs to build custom workflows.</p>
                  <ul className="space-y-3 mb-6">
                    {[
                      { icon: "description", label: "REST API Reference" },
                      { icon: "code_blocks", label: "Authentication Guide" },
                      { icon: "webhook", label: "Webhook Events" },
                    ].map((item) => (
                      <li key={item.label}>
                        <a className="flex items-center text-primary hover:underline font-label-md text-label-md group" href="#">
                          <MaterialIcon name={item.icon} className="text-sm mr-2 text-on-surface-variant group-hover:text-primary transition-colors" />
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full bg-surface-variant text-primary font-label-md text-label-md py-2 rounded uppercase tracking-wider hover:bg-surface-container-highest transition-colors relative z-10">
                  View API Portal
                </button>
              </div>
            </div>

            {/* Webhooks Section */}
            <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] transition-all duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                    <MaterialIcon name="webhook" className="text-primary" />
                    Webhooks
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">Subscribe to real-time events in your workspace.</p>
                </div>
                <button className="bg-surface-variant text-primary font-label-md text-label-md px-4 py-2 rounded uppercase tracking-wider hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                  <MaterialIcon name="add" className="text-sm" />
                  Add Endpoint
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant/10">
                      <th className="pb-3 font-medium w-1/3">Endpoint URL</th>
                      <th className="pb-3 font-medium">Events</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    <tr className="border-b border-outline-variant/5 hover:bg-surface-blue/50 transition-colors">
                      <td className="py-4 font-mono text-sm text-on-surface truncate pr-4">https://api.internal-erp.com/webhooks/cmms</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-xs">work_order.*</span>
                          <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-xs">asset.created</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-success text-sm font-medium">
                          <span className="w-2 h-2 rounded-full bg-success"></span> Healthy
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-primary hover:text-primary-container font-label-sm uppercase tracking-wider">Edit</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-blue/50 transition-colors">
                      <td className="py-4 font-mono text-sm text-on-surface truncate pr-4">https://hooks.slack.com/services/T000/B00/XXX</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-xs">work_order.priority_high</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-warning text-sm font-medium">
                          <span className="w-2 h-2 rounded-full bg-warning"></span> Failing (403)
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-primary hover:text-primary-container font-label-sm uppercase tracking-wider">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3rd Party Integrations Grid */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Connected Apps</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Pre-built integrations with your favorite tools.</p>
                </div>
                <a className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1" href="#">
                  Browse Directory
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Slack */}
                <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:border-primary/10 hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded bg-surface-container-low flex items-center justify-center border border-outline-variant/20 p-2">
                      <svg className="w-full h-full text-[#E51670]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 17.688 0a2.528 2.528 0 0 1 2.522 2.522v6.312zm-2.522 10.122a2.528 2.528 0 0 1 2.522 2.523A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.52-2.522v-2.521h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.313z" />
                      </svg>
                    </div>
                    <span className="bg-success/20 text-success px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Connected
                    </span>
                  </div>
                  <div className="flex-1 border-b border-outline-variant/10 pb-4 mb-4">
                    <h3 className="font-headline-md text-on-surface font-semibold mb-1 text-[16px]">Slack</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">Send real-time alerts for priority work orders and asset downtime directly to specific channels.</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-label-sm text-label-sm text-outline">Workspace: m-ease-ops</span>
                    <button className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-1">
                      <MaterialIcon name="settings" className="text-sm" /> Configure
                    </button>
                  </div>
                </div>

                {/* SAP */}
                <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:border-primary/10 hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded bg-surface-container-low flex items-center justify-center border border-outline-variant/20 p-2 font-bold text-xl text-[#008FD3]">SAP</div>
                    <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-outline-variant/20">Not Configured</span>
                  </div>
                  <div className="flex-1 border-b border-outline-variant/10 pb-4 mb-4">
                    <h3 className="font-headline-md text-on-surface font-semibold mb-1 text-[16px]">SAP ERP</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">Sync inventory parts, purchase orders, and financial data bi-directionally.</p>
                  </div>
                  <div className="mt-auto">
                    <button className="w-full bg-surface-container-lowest text-primary border border-primary/30 font-label-md text-label-md py-2 rounded uppercase tracking-wider hover:bg-surface-container-low transition-colors">
                      Connect Account
                    </button>
                  </div>
                </div>

                {/* Procore */}
                <div className="bg-surface-container-lowest rounded-xl p-card_padding border border-outline-variant/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] hover:border-primary/10 hover:-translate-y-1 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded bg-[#E45325] flex items-center justify-center border border-outline-variant/20 p-2 text-white font-bold">P</div>
                    <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-outline-variant/20">Not Configured</span>
                  </div>
                  <div className="flex-1 border-b border-outline-variant/10 pb-4 mb-4">
                    <h3 className="font-headline-md text-on-surface font-semibold mb-1 text-[16px]">Procore</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">Link facility maintenance tasks with broader construction management projects.</p>
                  </div>
                  <div className="mt-auto">
                    <button className="w-full bg-surface-container-lowest text-primary border border-primary/30 font-label-md text-label-md py-2 rounded uppercase tracking-wider hover:bg-surface-container-low transition-colors">
                      Connect Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </PaywallGate>
        </div>
      </div>

      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your new API key</DialogTitle>
            <DialogDescription>This is the only time you'll see the full key. Copy and store it now.</DialogDescription>
          </DialogHeader>
          <div className="bg-surface-container-low rounded-lg p-3 font-mono text-xs break-all border border-outline-variant/20">
            {newKey}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => newKey && copy(newKey)} className="border-outline-variant text-primary hover:bg-primary/5">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={() => setNewKey(null)} className="bg-primary hover:bg-primary-container text-on-primary">
              I've saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApiKeysPage;
