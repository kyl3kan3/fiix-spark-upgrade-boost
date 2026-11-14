import { createClient } from "npm:@supabase/supabase-js@2";
export async function reserveOperation(userId: string, operation: string): Promise<boolean> {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("consume_operation_budget", { p_user_id: userId, p_operation: operation });
  if (error) throw new Error("Operation budget unavailable");
  return data === true;
}
