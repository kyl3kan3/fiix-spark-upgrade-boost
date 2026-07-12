import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import {
  TurnstileConfigurationError,
  verifyTurnstile,
} from "../_shared/turnstile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const BUCKET = "public-request-photos";

const BodySchema = z.object({
  companyId: z.string().uuid(),
  turnstileToken: z.string().min(1).max(4096),
  files: z.array(z.object({
    name: z.string().trim().min(1).max(255),
    type: z.string().regex(/^image\/[a-z0-9.+-]+$/i),
    size: z.number().int().positive().max(MAX_PHOTO_BYTES),
  })).max(6),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fileExtension(name: string, mimeType: string): string {
  const known: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  if (known[mimeType.toLowerCase()]) return known[mimeType.toLowerCase()];

  const candidate = name.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,8}$/.test(candidate) ? candidate : "img";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }

    if (!await verifyTurnstile(request, parsed.data.turnstileToken)) {
      return json({ error: "Verification failed" }, 403);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: company, error: companyError } = await admin
      .from("companies")
      .select("id")
      .eq("id", parsed.data.companyId)
      .maybeSingle();
    if (companyError) throw companyError;
    if (!company) return json({ error: "Request portal not found" }, 404);

    const authorizationId = crypto.randomUUID();
    const uploadPrefix = `${company.id}/${authorizationId}`;
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    const { error: authorizationError } = await admin
      .from("public_request_authorizations")
      .insert({
        id: authorizationId,
        company_id: company.id,
        upload_prefix: uploadPrefix,
        expires_at: expiresAt,
      });
    if (authorizationError) throw authorizationError;

    try {
      const uploads = await Promise.all(parsed.data.files.map(async (file) => {
        const extension = fileExtension(file.name, file.type);
        const path = `${uploadPrefix}/${crypto.randomUUID()}.${extension}`;
        const { data, error } = await admin.storage
          .from(BUCKET)
          .createSignedUploadUrl(path, { upsert: false });
        if (error || !data) throw error ?? new Error("Failed to authorize upload");
        return { path: data.path, token: data.token };
      }));

      return json({ authorizationId, uploads, expiresAt });
    } catch (error) {
      await admin
        .from("public_request_authorizations")
        .delete()
        .eq("id", authorizationId);
      throw error;
    }
  } catch (error) {
    if (error instanceof TurnstileConfigurationError) {
      console.error(error.message);
      return json({ error: "Verification is not configured" }, 500);
    }

    console.error("authorize-public-request error", error);
    return json({ error: "Could not authorize this request" }, 500);
  }
});
