import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Triage {
  urgency: string | null;
  category: string | null;
  suggested_assignee_role: string | null;
  summary: string | null;
  status: string;
  error_message: string | null;
}

const urgencyColor: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export default function TriageSuggestionInline({ requestId }: { requestId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["triage", requestId],
    queryFn: async () => {
      const { data } = await (supabase as unknown as { from: typeof supabase.from })
        .from("public_request_triage")
        .select("urgency, category, suggested_assignee_role, summary, status, error_message")
        .eq("request_id", requestId)
        .maybeSingle();
      return (data ?? null) as Triage | null;
    },
    refetchInterval: (q) => (q.state.data?.status === "ready" ? false : 5000),
  });

  if (isLoading) return null;
  if (!data) return null;

  if (data.status === "failed") {
    return (
      <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-center gap-2">
        <AlertCircle className="h-3.5 w-3.5" /> AI triage failed: {data.error_message ?? "unknown"}
      </div>
    );
  }

  if (data.status !== "ready") {
    return (
      <div className="mb-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI triage in progress…
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">AI triage</span>
        {data.urgency && (
          <Badge variant={(urgencyColor[data.urgency] ?? "outline") as "destructive" | "secondary" | "outline"} className="text-xs">
            {data.urgency}
          </Badge>
        )}
        {data.category && <Badge variant="outline" className="text-xs">{data.category}</Badge>}
        {data.suggested_assignee_role && (
          <Badge variant="outline" className="text-xs">→ {data.suggested_assignee_role}</Badge>
        )}
      </div>
      {data.summary && <p className="text-sm text-foreground">{data.summary}</p>}
    </div>
  );
}