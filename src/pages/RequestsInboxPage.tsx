import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import MaterialIcon from "@/components/ui/material-icon";

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
  photos: string[] | null;
};

type FilterTab = "all" | "new" | "pending" | "urgent";

// Priority badge config
function getPriorityBadge(req: PublicRequest) {
  if (req.type === "urgent") {
    return {
      className: "font-label-sm text-label-sm uppercase bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] tracking-wider font-bold",
      label: "High",
    };
  }
  if (req.status === "new") {
    return {
      className: "font-label-sm text-label-sm uppercase bg-surface-variant text-on-surface px-2 py-0.5 rounded text-[10px] tracking-wider font-bold",
      label: "New",
    };
  }
  return {
    className: "font-label-sm text-label-sm uppercase bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-[10px] tracking-wider font-bold",
    label: "Pending",
  };
}

const RequestsInboxPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: company } = useQuery({
    queryKey: ["company-for-requests", user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user!.id)
        .single();
      if (!profile?.company_id) return null;
      const { data } = await supabase
        .from("companies")
        .select("id, name, public_slug")
        .eq("id", profile.company_id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["public_requests", filter],
    queryFn: async () => {
      let q = supabase
        .from("public_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (filter === "urgent") q = q.eq("type", "urgent");
      else if (filter === "pending") q = q.eq("status", "in_progress");
      else if (filter === "new") q = q.eq("status", "new");
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PublicRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PublicRequest["status"] }) => {
      if (status === "resolved") {
        const { data, error } = await supabase.functions.invoke("resolve-public-request", {
          body: { requestId: id },
        });
        if (error) throw error;
        return data as { emailSent?: boolean; reason?: string | null } | null;
      }
      const { error } = await supabase.from("public_requests").update({ status }).eq("id", id);
      if (error) throw error;
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
    const photoLines =
      (r.photos ?? []).length > 0
        ? [`Photos:`, ...(r.photos ?? []).map((u) => `- ${u}`)]
        : [];
    const params = new URLSearchParams({
      title: r.title,
      description: [
        r.description,
        r.location_text && `Location: ${r.location_text}`,
        r.contact_name && `From: ${r.contact_name}`,
        r.contact_email && `Email: ${r.contact_email}`,
        r.contact_phone && `Phone: ${r.contact_phone}`,
        ...photoLines,
      ]
        .filter(Boolean)
        .join("\n"),
      priority: r.type === "urgent" ? "high" : "medium",
    });
    updateStatus.mutate({ id: r.id, status: "in_progress" });
    navigate(`/work-orders/new?${params.toString()}`);
  };

  const portalUrl = company?.public_slug
    ? `https://maintenease.com/r/${company.public_slug}`
    : null;

  const newCount = useMemo(() => requests.filter((r) => r.status === "new").length, [requests]);

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? requests[0] ?? null,
    [requests, selectedId]
  );

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All Requests" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "urgent", label: "High Priority" },
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Request Inbox | MaintenEase</title>
        <meta
          name="description"
          content="Public maintenance requests submitted via your branded portal. Triage urgent issues and convert them to work orders."
        />
        <link rel="canonical" href="https://maintenease.com/requests" />
      </Helmet>

      {/* Split Pane Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left Pane: List View */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-surface shadow-level-1 rounded-xl border border-outline-variant/20 overflow-hidden flex-shrink-0">
          {/* List Header & Filters */}
          <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-md text-headline-md text-primary">Inbox</h2>
              <span className="font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded text-primary">
                {newCount} Open
              </span>
            </div>

            {/* Portal URL banner */}
            {portalUrl && (
              <div className="mb-4 bg-surface-container-low rounded-lg border border-outline-variant/20 p-3">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Your public portal</p>
                <p className="font-label-sm text-label-sm text-primary font-mono truncate mb-2">{portalUrl}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Copied"); }}
                    className="flex items-center gap-1 px-3 py-1 rounded border border-outline-variant/50 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <MaterialIcon name="content_copy" className="text-[14px]" />
                    Copy
                  </button>
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded border border-outline-variant/50 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <MaterialIcon name="open_in_new" className="text-[14px]" />
                    Open
                  </a>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                    filter === tab.value
                      ? "border border-primary text-primary bg-primary/5"
                      : "border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background" style={{ scrollbarWidth: "thin" }}>
            {requests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MaterialIcon name="inbox" className="text-5xl text-on-surface-variant/30 mb-3 block" />
                <p className="font-label-md text-label-md text-on-surface mb-1">No requests yet</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Share your portal link to start receiving submissions.
                </p>
              </div>
            ) : (
              requests.map((r) => {
                const isActive = (selected?.id ?? null) === r.id;
                const badge = getPriorityBadge(r);
                const timeAgo = formatDistanceToNow(new Date(r.created_at), { addSuffix: true });
                const locationText = r.location_text ?? (r.contact_name ? null : null);

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`rounded-lg p-4 cursor-pointer transition-all relative overflow-hidden ${
                      isActive
                        ? "bg-surface border-2 border-primary/20 shadow-sm"
                        : "bg-surface border border-transparent hover:border-primary/10 shadow-sm hover:shadow-md hover:-translate-y-[2px]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={badge.className}>{badge.label}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          #{r.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {timeAgo}
                      </span>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface mb-1">{r.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-3 text-sm">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-3 mt-auto pt-3 border-t border-outline-variant/10">
                      {r.contact_name && (
                        <>
                          <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-surface">
                            {r.contact_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-label-sm text-label-sm text-secondary">
                            {r.contact_name}
                          </span>
                          <span className="text-outline-variant text-xs mx-1">•</span>
                        </>
                      )}
                      {r.location_text && (
                        <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                          <MaterialIcon name="location_on" className="text-[14px]" />
                          {r.location_text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Detail View */}
        <div className="flex-1 bg-surface shadow-level-1 rounded-xl border border-outline-variant/20 overflow-hidden flex-col hidden lg:flex relative">
          {selected ? (
            <>
              {/* Detail Header */}
              <div className="p-6 lg:p-8 border-b border-outline-variant/20 bg-surface-container-lowest sticky top-0 z-10 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      #{selected.id.slice(0, 6).toUpperCase()}
                    </span>
                    {selected.type === "urgent" && (
                      <span className="font-label-sm text-label-sm uppercase bg-error-container text-on-error-container px-2 py-0.5 rounded text-xs tracking-wider font-bold">
                        High Priority
                      </span>
                    )}
                    <span className="font-label-sm text-label-sm uppercase border border-outline-variant/50 text-on-surface-variant px-2 py-0.5 rounded text-xs tracking-wider font-bold">
                      {selected.status === "new"
                        ? "New"
                        : selected.status === "in_progress"
                        ? "In Progress"
                        : "Resolved"}
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                    {selected.title}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Submitted{" "}
                    {new Date(selected.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {/* Quick Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {selected.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus.mutate({ id: selected.id, status: "resolved" })}
                      className="px-4 py-2 border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => convertToWorkOrder(selected)}
                    className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md uppercase rounded shadow-sm hover:shadow-md transition-all"
                  >
                    Approve &amp; Assign
                  </button>
                </div>
              </div>

              {/* Detail Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ scrollbarWidth: "thin" }}>
                {/* Bento Grid for Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 flex flex-col justify-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                      Requester
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {selected.contact_name
                          ? selected.contact_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "?"}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface leading-none">
                          {selected.contact_name ?? "Anonymous"}
                        </p>
                        {selected.contact_email && (
                          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                            {selected.contact_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 flex flex-col justify-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                      Location / Asset
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <MaterialIcon name="location_on" className="text-primary" />
                      <div>
                        <p className="font-label-md text-label-md text-on-surface leading-none">
                          {selected.location_text ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 flex flex-col justify-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                      Category
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <MaterialIcon name="build" className="text-warning" />
                      <div>
                        <p className="font-label-md text-label-md text-on-surface leading-none">
                          {selected.type === "urgent" ? "Urgent" : "Standard"}
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                          Corrective
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-8">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
                    Description
                  </h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant bg-surface-container-low p-4 rounded-lg border border-outline-variant/10 leading-relaxed whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </div>

                {/* Attachments Section */}
                {(selected.photos ?? []).length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
                      Attachments ({(selected.photos ?? []).length})
                    </h3>
                    <div className="flex gap-4 flex-wrap">
                      {(selected.photos ?? []).map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-48 h-32 rounded-lg overflow-hidden border border-outline-variant/20 relative group cursor-pointer block"
                        >
                          <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/10 transition-colors z-10 flex items-center justify-center">
                            <MaterialIcon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <img
                            alt={`Request photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            src={url}
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline / Activity */}
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 border-b border-outline-variant/20 pb-2">
                    Activity
                  </h3>
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
                      <p className="font-label-md text-label-md text-on-surface">Request Created</p>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                        {selected.contact_name ? `by ${selected.contact_name} • ` : ""}
                        {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selected.status === "in_progress" && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-surface-container-high border-2 border-outline-variant" />
                        <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 inline-block mt-1">
                          <p className="font-body-md text-body-md text-on-surface-variant text-sm italic">
                            Request accepted and work order conversion initiated.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty state for right pane */
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant">
              <MaterialIcon name="inbox" className="text-5xl opacity-20" />
              <p className="font-label-md text-label-md">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestsInboxPage;
