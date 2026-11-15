import { supabase } from "@/integrations/supabase/client";

export async function generateWorkOrderSummary(workOrderId: string, signal: AbortSignal): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to generate a summary.");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/work-order-summary`, {
    method: "POST", signal,
    headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ workOrderId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "AI summary is unavailable.");
  }
  if (!response.body) throw new Error("No summary was returned.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let summary = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      const event = JSON.parse(line.slice(6));
      if (event.type === "text-delta") summary += event.delta;
      if (event.type === "error") throw new Error(event.errorText || "AI summary failed.");
    }
  }
  if (!summary.trim()) throw new Error("No summary was returned.");
  return summary.trim();
}