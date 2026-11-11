// Browser advertising telemetry is disabled on the authenticated origin.
export function trackPageView(_path: string): void {}
export function setUserData(_opts: { userId?: string | null; email?: string | null } | null): void {}
export function trackPurchaseConversion(_opts: { transactionId?: string; email?: string | null; value?: number; currency?: string }): void {}
