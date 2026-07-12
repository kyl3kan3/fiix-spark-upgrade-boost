import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/supabaseHelpers";

export type PaddleEnvironment = "sandbox" | "live";

/**
 * Resolves a logical price id (e.g. "pro_monthly") to a Paddle price id via
 * the get-paddle-price edge function.
 */
export async function resolvePaddlePriceId(
  priceId: string,
  environment: PaddleEnvironment,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment },
  });
  if (error || !data?.paddleId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.paddleId as string;
}

export interface BillingUsageCounts {
  assets: number;
  workOrders: number;
  seats: number;
}

/**
 * Head-only count queries for the billing usage meters: total assets, work
 * orders created this calendar month, and profile seats. Missing counts
 * (including failed queries) intentionally resolve to 0 rather than throwing —
 * the usage meters are best-effort.
 */
export async function getBillingUsageCounts(): Promise<BillingUsageCounts> {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

  const [{ count: assets }, { count: workOrders }, { count: seats }] =
    await Promise.all([
      supabase.from("assets").select("*", { count: "exact", head: true }),
      supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

  return {
    assets: assets ?? 0,
    workOrders: workOrders ?? 0,
    seats: seats ?? 0,
  };
}

/**
 * Creates a Paddle customer-portal session via the paddle-portal edge
 * function. Returns the portal URL, or null if the function returned none.
 */
export async function createBillingPortalSession(): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke<{ url?: string }>(
    "paddle-portal",
  );
  if (error) throw error;
  return data?.url ?? null;
}

/**
 * Sets the subscription's extra-seat count (the new total of paid extra
 * seats, not a delta) via the update-seats edge function.
 */
export async function updateSubscriptionSeats(extraSeats: number): Promise<void> {
  const { data, error } = await supabase.functions.invoke("update-seats", {
    body: { extraSeats },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) {
    throw new Error((data as { error: string }).error);
  }
}

export interface CheckoutContext {
  checkoutAuthorizationId: string;
  email?: string;
}

/**
 * Creates a short-lived, administrator-only checkout authorization. The
 * browser receives only an opaque id; the webhook resolves its company from
 * the server-side authorization record.
 */
export async function createCheckoutContext(
  environment: PaddleEnvironment,
): Promise<CheckoutContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase.functions.invoke<
    CheckoutContext & { error?: string }
  >("create-checkout-context", { body: { environment } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.checkoutAuthorizationId) {
    throw new Error("Could not authorize checkout");
  }

  return {
    checkoutAuthorizationId: data.checkoutAuthorizationId,
    email: data.email ?? user.email ?? undefined,
  };
}
