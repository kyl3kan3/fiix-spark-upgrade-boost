import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "claude-sonnet-4-6";
const BUCKET = "onboarding-docs";
const MAX_BYTES = 10 * 1024 * 1024;

const SYSTEM_PROMPT = `You extract a maintenance equipment/asset register from a document.
Read the provided file (a spreadsheet export, asset list, manual, or photo of equipment/labels) and
identify distinct physical assets. Call propose_assets exactly once with what you find.
- Only include real, distinct assets you can actually see in the document. Do not invent rows.
- name is required and should be human-readable. Fill status/location/model/serial_number/description only when present.
- If the document contains no identifiable assets, call propose_assets with an empty list.`;

const tools = [
  {
    name: "propose_assets",
    description: "Return the list of assets extracted from the document for the user to confirm.",
    input_schema: {
      type: "object",
      properties: {
        assets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              status: { type: "string" },
              location: { type: "string" },
              model: { type: "string" },
              serial_number: { type: "string" },
              description: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
      required: ["assets"],
    },
  },
];

const TEXT_TYPES = ["text/", "application/json", "application/csv"];

// deno-lint-ignore no-explicit-any
function buildContent(mime: string, bytes: Uint8Array): any[] {
  const isText = TEXT_TYPES.some((t) => mime.startsWith(t)) || mime.endsWith("csv");
  if (isText) {
    const text = new TextDecoder().decode(bytes).slice(0, 100_000);
    return [{ type: "text", text: `Document contents:\n\n${text}` }];
  }
  const data = base64Encode(bytes);
  if (mime === "application/pdf") {
    return [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
      { type: "text", text: "Extract the assets from this document." },
    ];
  }
  if (mime.startsWith("image/")) {
    return [
      { type: "image", source: { type: "base64", media_type: mime, data } },
      { type: "text", text: "Extract the assets visible in this image." },
    ];
  }
  // Fallback: try to read as text.
  const text = new TextDecoder().decode(bytes).slice(0, 100_000);
  return [{ type: "text", text: `Document contents:\n\n${text}` }];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Only POST allowed", { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Extraction is not configured (missing API key)." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await db.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const storagePath: string | undefined = body?.storage_path;
    const documentId: string | undefined = body?.document_id;
    let mime: string = body?.mime_type ?? "";
    if (!storagePath) {
      return new Response(JSON.stringify({ error: "Missing storage_path." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RLS on the bucket scopes this download to the caller's company.
    const { data: file, error: dlErr } = await db.storage.from(BUCKET).download(storagePath);
    if (dlErr || !file) {
      return new Response(JSON.stringify({ error: "Couldn't read that document." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "Document is too large to extract (max 10 MB)." }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!mime) mime = file.type || "application/octet-stream";

    if (documentId) {
      await db.from("onboarding_documents").update({ status: "processing" }).eq("id", documentId);
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        tool_choice: { type: "tool", name: "propose_assets" },
        messages: [{ role: "user", content: buildContent(mime, bytes) }],
      }),
    });

    if (!resp.ok) {
      console.error("Anthropic error:", resp.status, await resp.text());
      if (documentId) await db.from("onboarding_documents").update({ status: "failed" }).eq("id", documentId);
      return new Response(JSON.stringify({ error: "The extractor is temporarily unavailable." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    // deno-lint-ignore no-explicit-any
    const toolUse = (data?.content ?? []).find((b: any) => b.type === "tool_use" && b.name === "propose_assets");
    const assets = Array.isArray(toolUse?.input?.assets) ? toolUse.input.assets : [];

    if (documentId) {
      await db.from("onboarding_documents").update({ status: "processed" }).eq("id", documentId);
    }

    return new Response(JSON.stringify({ assets }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-assets error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
