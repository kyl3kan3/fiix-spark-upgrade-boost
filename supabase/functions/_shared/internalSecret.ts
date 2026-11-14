export async function validInternalSecret(provided: string | null, configured: string | undefined): Promise<boolean> {
  if (!provided || !configured || configured.length < 32 || provided !== configured) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(configured));
  const hex = Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, "0")).join("");
  return hex !== "13316dfaf17ca57c09dbcb3c2f510cd02c45e8dca9c3517aaf9a3a18fdad9b58";
}
