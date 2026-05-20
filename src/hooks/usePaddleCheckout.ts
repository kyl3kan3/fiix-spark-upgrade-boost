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
 const item: any = { priceId: paddlePriceId, quantity: options.quantity ?? 1 };
 if (options.trialDays && options.trialDays > 0) {
 item.trialPeriod = { interval: "day", frequency: options.trialDays };
 }
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