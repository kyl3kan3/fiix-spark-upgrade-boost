import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function client(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "create_work_order",
  title: "Create work order",
  description: "Create a new maintenance work order for the signed-in user's company.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Short title for the work order."),
    description: z.string().optional().describe("Longer description of the work needed."),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("Priority. Defaults to medium."),
    due_date: z.string().datetime().optional().describe("ISO 8601 due date."),
    asset_id: z.string().uuid().optional().describe("Related asset id, if known."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, description, priority, due_date, asset_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = client(ctx);
    // Look up the user's company_id via the security-definer helper used elsewhere in the app.
    const { data: companyId, error: companyErr } = await sb.rpc("get_user_company", {
      _user_id: ctx.getUserId(),
    });
    if (companyErr) return { content: [{ type: "text", text: companyErr.message }], isError: true };
    const { data, error } = await sb
      .from("work_orders")
      .insert({
        title,
        description: description ?? null,
        priority: priority ?? "medium",
        status: "pending",
        due_date: due_date ?? null,
        asset_id: asset_id ?? null,
        created_by: ctx.getUserId(),
        company_id: companyId,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created work order ${data?.id}` }],
      structuredContent: { row: data },
    };
  },
});