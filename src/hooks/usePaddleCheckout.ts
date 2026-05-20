import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";

interface OpenOptions {
 priceId: string;
 quantity?: number;
 customerEmail?: string;
 customData?: Record<string, string>;
 successUrl?: string;
 trialDays?: number;
}

export function usePaddleCheckout() {
 const [loading, setLoading] = useState(false);

 const openCheckout = async (options: OpenOptions) => {
 setLoading(true);
 try {
 await initializePaddle();
 const paddlePriceId = await getPaddlePriceId(options.priceId);
      // Trial period is configured on the Paddle price itself, so we don't
      // pass trialPeriod here (overlay checkout doesn't accept item-level overrides).
      const item: any = { priceId: paddlePriceId, quantity: options.quantity ?? 1 };
 window.Paddle.Checkout.open({
 items: [item],
 customer: options.customerEmail ? { email: options.customerEmail } : undefined,
 customData: options.customData,
 settings: {
 displayMode: "overlay",
 successUrl: options.successUrl || `${window.location.origin}/billing?success=1`,
 allowLogout: false,
 variant: "one-page",
 },
 });
 } finally {
 setLoading(false);
 }
 };

 return { openCheckout, loading };
}