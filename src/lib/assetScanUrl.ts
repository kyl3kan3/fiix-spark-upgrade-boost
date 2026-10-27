export function assetScanUrl(assetId: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "https://maintenease.com");
  return `${base}/assets/${assetId}`;
}
