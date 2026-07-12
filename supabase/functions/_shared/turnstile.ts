export class TurnstileConfigurationError extends Error {}

export async function verifyTurnstile(
  request: Request,
  token: string,
): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    throw new TurnstileConfigurationError(
      "TURNSTILE_SECRET_KEY is not configured",
    );
  }

  const form = new URLSearchParams({ secret, response: token });
  const forwardedFor =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "";
  const remoteIp = forwardedFor.split(",")[0]?.trim();
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  if (!response.ok) return false;

  const result = await response.json().catch(() => null) as
    | { success?: boolean }
    | null;
  return result?.success === true;
}
