import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";
import { toast } from "sonner";

type Prospect = {
  id: string;
  domain: string;
  url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  authority: number | null;
  notes: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "won", label: "Link live" },
  { value: "declined", label: "Declined" },
] as const;

const statusTone: Record<string, string> = {
  prospect: "bg-muted text-foreground",
  contacted: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  replied: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  declined: "bg-red-500/15 text-red-700 dark:text-red-300",
};

const AdminBacklinksPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdminUser, isLoading: roleLoading } = useAdminStatus();
  const [rows, setRows] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    domain: "",
    url: "",
    contact_name: "",
    contact_email: "",
    authority: "",
    status: "prospect",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("backlink_prospects" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setRows((data as unknown as Prospect[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdminUser) load();
  }, [isAdminUser]);

  const stats = useMemo(() => {
    const s = { total: rows.length, contacted: 0, replied: 0, won: 0 };
    for (const r of rows) {
      if (r.status === "contacted") s.contacted++;
      else if (r.status === "replied") s.replied++;
      else if (r.status === "won") s.won++;
    }
    return s;
  }, [rows]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.domain.trim()) return;
    setSaving(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();
    if (!profile?.company_id) {
      toast.error("No company context");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("backlink_prospects" as any).insert({
      company_id: profile.company_id,
      domain: form.domain.trim(),
      url: form.url.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      status: form.status,
      authority: form.authority ? Number(form.authority) : null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Prospect added");
    setForm({ domain: "", url: "", contact_name: "", contact_email: "", authority: "", status: "prospect", notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("backlink_prospects" as any)
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this prospect?")) return;
    const { error } = await supabase.from("backlink_prospects" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdminUser) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <p className="text-foreground">You need administrator access to view the backlink tracker.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Backlink Outreach Tracker — MaintenEase Admin</title>
        <meta name="description" content="Track backlink prospects, outreach status, and won links for MaintenEase link-building." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-3">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold tracking-normal">Backlink Outreach Tracker</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Log referring-domain prospects, track outreach, and mark links live. Data is scoped to your company.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total prospects" value={stats.total} />
          <StatCard label="Contacted" value={stats.contacted} />
          <StatCard label="Replied" value={stats.replied} />
          <StatCard label="Links live" value={stats.won} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Add prospect</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <Label htmlFor="domain">Domain *</Label>
                <Input id="domain" required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="g2.com" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="url">Target URL</Label>
                <Input id="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://g2.com/categories/cmms" />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact name</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact email</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="authority">Authority score</Label>
                <Input id="authority" type="number" min={0} max={100} value={form.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Angle, pitch, follow-up date…" />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Add prospect
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prospects ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">No prospects yet — add your first target above.</div>
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Domain</th>
                    <th className="px-4 py-2">Contact</th>
                    <th className="px-4 py-2">DR</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Notes</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{r.domain}</div>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <div>{r.contact_name ?? "—"}</div>
                        {r.contact_email && <div className="text-xs text-muted-foreground">{r.contact_email}</div>}
                      </td>
                      <td className="px-4 py-3 text-foreground">{r.authority ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge className={`mt-1 text-[10px] ${statusTone[r.status] ?? ""}`} variant="secondary">{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3 max-w-md text-muted-foreground text-xs whitespace-pre-wrap">{r.notes ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-lg border border-border bg-card px-4 py-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-2xl font-semibold text-foreground">{value}</div>
  </div>
);

export default AdminBacklinksPage;