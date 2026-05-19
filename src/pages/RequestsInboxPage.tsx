import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AlertTriangle, Copy, ExternalLink, Inbox } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type PublicRequest = {
  id: string;
  type: "standard" | "urgent";
  title: string;
  description: string;
  location_text: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
};

const RequestsInboxPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "urgent" | "standard">("all");

  const { data: company } = useQuery({
    queryKey: ["company-for-requests", user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user!.id).single();
      if (!profile?.company_id) return null;
      const { data } = await supabase.from("companies").select("id, name, public_slug").eq("id", profile.company_id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["public_requests", filter],
    queryFn: async () => {
      let q = supabase.from("public_requests").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("type", filter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PublicRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PublicRequest["status"] }) => {
      const { error } = await supabase.from("public_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public_requests"] });
      toast.success("Updated");
    },
  });

  const convertToWorkOrder = (r: PublicRequest) => {
    const params = new URLSearchParams({
      title: r.title,
      description: [r.description, r.location_text && `Location: ${r.location_text}`, r.contact_name && `From: ${r.contact_name}`, r.contact_email && `Email: ${r.contact_email}`, r.contact_phone && `Phone: ${r.contact_phone}`].filter(Boolean).join("\n"),
      priority: r.type === "urgent" ? "high" : "medium",
    });
    updateStatus.mutate({ id: r.id, status: "in_progress" });
    navigate(`/work-orders/new?${params.toString()}`);
  };

  const portalUrl = company?.public_slug ? `https://maintenease.com/r/${company.public_slug}` : null;

  const newCount = useMemo(() => requests.filter(r => r.status === "new").length, [requests]);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Request Inbox | MaintenEase</title>
        <meta name="description" content="Public maintenance requests submitted via your branded portal. Triage urgent issues and convert them to work orders." />
        <link rel="canonical" href="https://maintenease.com/requests" />
      </Helmet>
      <PageHeader
        code="REQ · INBOX"
        title="Request Inbox"
        description={`Public submissions from your request portal. ${newCount} new.`}
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {portalUrl && (
          <div className="rounded-lg border border-maintenease-200 bg-maintenease-50 p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Your public request portal</p>
              <p className="text-sm text-gray-700 font-mono break-all">{portalUrl}</p>
              <p className="text-xs text-gray-600 mt-1">Share this link or embed it on your website footer. Anyone can submit a request — no login required.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={portalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> Open</a>
              </Button>
            </div>
          </div>
        )}

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="urgent" className="data-[state=active]:text-red-700">Urgent</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
          </TabsList>
        </Tabs>

        {requests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <Inbox className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">No requests yet</p>
            <p className="text-sm text-gray-600 mt-1">Share your portal link to start receiving submissions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className={`rounded-lg border p-5 bg-white ${r.type === "urgent" && r.status === "new" ? "border-red-300 ring-2 ring-red-100" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.type === "urgent" && (
                      <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Urgent</Badge>
                    )}
                    <Badge variant={r.status === "new" ? "default" : r.status === "in_progress" ? "secondary" : "outline"}>
                      {r.status === "in_progress" ? "In progress" : r.status === "new" ? "New" : "Resolved"}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
                {r.description && <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{r.description}</p>}
                <div className="text-xs text-gray-600 space-x-3 mb-3">
                  {r.location_text && <span>📍 {r.location_text}</span>}
                  {r.contact_name && <span>👤 {r.contact_name}</span>}
                  {r.contact_email && <span>✉ {r.contact_email}</span>}
                  {r.contact_phone && <span>📞 {r.contact_phone}</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => convertToWorkOrder(r)}>Convert to work order</Button>
                  {r.status !== "resolved" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: r.id, status: "resolved" })}>
                      Mark resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RequestsInboxPage;