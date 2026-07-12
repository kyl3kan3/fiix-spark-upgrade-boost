import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STORAGE_BASE_URL =
  `${SUPABASE_URL}/storage/v1/object/public/public-request-photos/`;

const photoPathSchema = z
  .string()
  .min(1)
  .max(500)
  .regex(/^[a-zA-Z0-9._/-]+$/)
  .refine((path) => !path.startsWith("/") && !path.includes(".."), {
    message: "Invalid photo path",
  });

const BodySchema = z.object({
  authorizationId: z.string().uuid(),
  type: z.enum(["standard", "urgent"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  location_text: z.string().trim().max(300).optional().nullable(),
  contact_name: z.string().trim().max(120).optional().nullable(),
  contact_email: z.string().trim().email().max(255).optional().or(z.literal(""))
    .nullable(),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  photoPaths: z.array(photoPathSchema).max(6).optional().default([]),
  user_agent: z.string().max(500).optional().nullable(),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    const payload = parsed.data;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await admin.rpc(
      "create_public_request_from_authorization",
      {
        _authorization_id: payload.authorizationId,
        _type: payload.type,
        _title: payload.title,
        _description: payload.description,
        _location_text: payload.location_text || null,
        _contact_name: payload.contact_name || null,
        _contact_email: payload.contact_email || null,
        _contact_phone: payload.contact_phone || null,
        _photo_paths: payload.photoPaths,
        _user_agent: payload.user_agent || null,
        _storage_base_url: STORAGE_BASE_URL,
      },
    );

    if (error) {
      if (error.code === "42501") return json({ error: error.message }, 403);
      throw error;
    }

    const result = data as {
      request_id?: string;
      company_id?: string;
    } | null;
    if (!result?.request_id || !result.company_id) {
      throw new Error("Failed to create request");
    }

    // The database insert trigger dispatches deduplicated notifications.
    return json({ ok: true, requestId: result.request_id });
  } catch (error) {
    console.error("submit-public-request error:", error);
    return json({ error: "An internal error occurred. Please try again." }, 500);
  }
});
