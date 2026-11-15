import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWorkOrderSummary } from "@/services/workOrderSummaryService";

export function WorkOrderAiSummary({ workOrderId }: { workOrderId: string }) {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const generate = async () => {
    if (loading) return;
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    setError("");
    try { setSummary(await generateWorkOrderSummary(workOrderId, abort.signal)); }
    catch (cause) { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "Summary unavailable."); }
    finally { setLoading(false); }
  };
  return <section className="border-y border-border py-5 space-y-3" aria-label="AI summary">
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-semibold"><Sparkles className="h-4 w-4 text-primary" />AI summary</h2>
      {loading ? <Button variant="outline" size="sm" onClick={() => controller.current?.abort()}><Square className="mr-2 h-3 w-3" />Stop</Button>
        : <Button variant="outline" size="sm" onClick={generate}><Sparkles className="mr-2 h-4 w-4" />{summary ? "Refresh summary" : "Generate summary"}</Button>}
    </div>
    {loading && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Summarizing…</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {summary && <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{summary}</p>}
  </section>;
}