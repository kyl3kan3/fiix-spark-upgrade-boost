import { corsHeadersForRequest } from "../_shared/cors.ts";

const BASE_ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-notify-secret, x-ingest-token, svix-id, svix-timestamp, svix-signature, paddle-signature";

/** MCP streamable HTTP + OAuth discovery headers (see @lovable.dev/mcp-js). */
const MCP_CORS_EXTRAS: Record<string, string> = {
  "Access-Control-Allow-Headers": `${BASE_ALLOW_HEADERS}, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID`,
  "Access-Control-Expose-Headers":
    "WWW-Authenticate, Mcp-Session-Id, Mcp-Protocol-Version",
};

export function mergeVary(
  existing: string | null,
  addition: string,
): string {
  const merged = new Set<string>();
  for (const token of (existing ?? "").split(",")) {
    const trimmed = token.trim();
    if (trimmed) merged.add(trimmed);
  }
  for (const token of addition.split(",")) {
    const trimmed = token.trim();
    if (trimmed) merged.add(trimmed);
  }
  return [...merged].join(", ");
}

function stripAccessControlHeaders(headers: Headers): void {
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith("access-control-")) {
      headers.delete(name);
    }
  }
}

function applyCorsRecord(
  headers: Headers,
  cors: Record<string, string>,
): void {
  const priorVary = headers.get("Vary");
  for (const key of Object.keys(cors)) {
    const value = cors[key];
    if (key === "Vary") {
      headers.set("Vary", mergeVary(priorVary, value));
    } else {
      headers.set(key, value);
    }
  }
}

export function applyMcpCors(req: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  stripAccessControlHeaders(headers);

  const origin = req.headers.get("Origin");
  if (!origin) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const cors = corsHeadersForRequest(req, MCP_CORS_EXTRAS);
  applyCorsRecord(headers, cors);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function handleMcpCorsPreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeadersForRequest(req, MCP_CORS_EXTRAS),
  });
}

export function wrapMcpHandler(
  handler: (req: Request) => Response | Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req) => {
    const preflight = handleMcpCorsPreflight(req);
    if (preflight) return preflight;
    const response = await handler(req);
    return applyMcpCors(req, response);
  };
}