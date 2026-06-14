import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AlertTriangle, Copy, ExternalLink, Inbox } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRequestInboxCompany,
  listPublicRequests,
  resolvePublicRequest,
  updatePublicRequestStatus,
  type PublicRequest,
} from "@/services/requestService";
import { useAuth } from "@/providers/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import TriageSuggestionInline from "@/components/selfHealing/TriageSuggestionInline";

const RequestsInboxPage = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [filter, setFilter] = useState<"all" | "urgent" | "standard">("all");

 const { data: company } = useQuery({
 queryKey: ["company-for-requests", user?.id],
 queryFn: getRequestInboxCompany,
 enabled: !!user,
 });

 const { data: requests = [] } = useQuery({
 queryKey: ["public_requests", filter],
 queryFn: () => listPublicRequests(filter),
 });

 const updateStatus = useMutation({
 mutationFn: async ({ id, status }: { id: string; status: PublicRequest["status"] }) => {
 if (status === "resolved") {
 return await resolvePublicRequest(id);
 }
 await updatePublicRequestStatus(id, status);
 return null;
 },
 onSuccess: (data, variables) => {
 queryClient.invalidateQueries({ queryKey: ["public_requests"] });
 if (variables.status === "resolved") {
 if (data?.emailSent) {
 toast.success("Resolved and client notified");
 } else {
 toast.success("Marked resolved");
 }
 return;
 }
 toast.success("Updated");
 },
 });

 const convertToWorkOrder = (r: PublicRequest) => {
    const photoLines = (r.photos ?? []).length > 0 ? [`Photos:`, ...(r.photos ?? []).map((u) => `- ${u}`)] : [];
 const params = new URLSearchParams({
 title: r.title,
      description: [
        r.description,
        r.location_text && `Location: ${r.location_text}`,
        r.contact_name && `From: ${r.contact_name}`,
        r.contact_email && `Email: ${r.contact_email}`,
        r.contact_phone && `Phone: ${r.contact_phone}`,
        ...photoLines,
      ].filter(Boolean).join("\n"),
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
 title="Request Inbox"
 description={`Public submissions from your request portal.${newCount > 0 ? ` ${newCount} new.` : ""}`}
 />

 <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
 {/* Portal URL banner */}
 {portalUrl && (
 <div className="bg-surface-container-lowest rounded-xl border border-primary/20 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between shadow-sm">
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground mb-0.5">Your public request portal</p>
 <p className="text-sm font-mono text-primary break-all truncate">{portalUrl}</p>
 <p className="text-xs text-muted-foreground mt-1">Share this link or embed it on your website footer. Anyone can submit a request — no login required.</p>
 </div>
 <div className="flex gap-2 shrink-0">
 <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Copied"); }}>
 <Copy className="h-3.5 w-3.5" /> Copy
 </Button>
 <Button variant="outline" size="sm" className="gap-1.5" asChild>
 <a href={portalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open</a>
 </Button>
 </div>
 </div>
 )}

 {/* Filter tabs */}
 <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
 <TabsList className="bg-surface-container-lowest border border-border/60 rounded-lg p-1">
 <TabsTrigger value="all" className="rounded-md text-sm font-semibold">All Requests</TabsTrigger>
 <TabsTrigger value="urgent" className="rounded-md text-sm font-semibold data-[state=active]:text-destructive">Urgent</TabsTrigger>
 <TabsTrigger value="standard" className="rounded-md text-sm font-semibold">Standard</TabsTrigger>
 </TabsList>
 </Tabs>

 {/* Inbox list */}
 {requests.length === 0 ? (
 <div className="text-center py-20 bg-surface-container-lowest rounded-xl border-2 border-dashed border-border/60">
 <Inbox className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
 <p className="font-headline font-semibold text-lg text-foreground mb-1">No requests yet</p>
 <p className="text-sm text-muted-foreground">Share your portal link to start receiving submissions.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {requests.map((r) => (
 <div
 key={r.id}
 className={`rounded-xl border bg-surface-container-lowest shadow-sm transition-all duration-200 overflow-hidden ${
 r.type === "urgent" && r.status === "new"
 ? "border-destructive/30 shadow-destructive/5"
 : "border-border/60 hover:border-primary/20 hover:shadow-md"
 }`}
 >
 {/* Urgent accent bar */}
 {r.type === "urgent" && r.status === "new" && (
 <div className="h-1 bg-destructive w-full" />
 )}
 <div className="p-5">
 {/* Header row */}
 <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
 <div className="flex items-center gap-2 flex-wrap">
 {r.type === "urgent" && (
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/30">
 <AlertTriangle className="h-3 w-3" /> Urgent
 </span>
 )}
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
 r.status === "new"
 ? "bg-primary/10 text-primary border-primary/30"
 : r.status === "in_progress"
 ? "bg-warning/10 text-warning border-warning/30"
 : "bg-success/10 text-success border-success/30"
 }`}>
 {r.status === "in_progress" ? "In Progress" : r.status === "new" ? "New" : "Resolved"}
 </span>
 <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
 </div>
 </div>

 <h3 className="font-headline font-semibold text-base text-foreground mb-1.5">{r.title}</h3>
 {r.description && (
 <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap line-clamp-3">{r.description}</p>
 )}

 {/* Photo thumbnails */}
 {(r.photos ?? []).length > 0 && (
 <div className="flex flex-wrap gap-2 mb-3">
 {(r.photos ?? []).map((url, idx) => (
 <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
 className="block h-16 w-16 rounded-lg overflow-hidden border border-border/60 hover:opacity-80 transition-opacity">
 <img src={url} alt={`Request photo ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
 </a>
 ))}
 </div>
 )}

 {/* Meta info */}
 <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
 {r.location_text && (
 <span className="flex items-center gap-1">
 <span className="text-primary">📍</span> {r.location_text}
 </span>
 )}
 {r.contact_name && <span>👤 {r.contact_name}</span>}
 {r.contact_email && <span>✉ {r.contact_email}</span>}
 {r.contact_phone && <span>📞 {r.contact_phone}</span>}
 </div>

 {/* Actions */}
 <div className="flex gap-2 flex-wrap">
 <Button
 size="sm"
 className="gap-1.5 text-xs font-semibold uppercase tracking-wide"
 onClick={() => convertToWorkOrder(r)}
 >
 Convert to Work Order
 </Button>
 {r.status !== "resolved" && (
 <Button
 size="sm"
 variant="outline"
 className="gap-1.5 text-xs"
 onClick={() => updateStatus.mutate({ id: r.id, status: "resolved" })}
 >
 Mark Resolved
 </Button>
 )}
 </div>
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