import { corsHeadersForRequest } from "../_shared/cors.ts";

/** MCP streamable HTTP + OAuth discovery headers (see @lovable.dev/mcp-js). */
const MCP_CORS_EXTRAS: Record<string, string> = {
  "Access-Control-Expose-Headers":
    "WWW-Authenticate, Mcp-Session-Id, Mcp-Protocol-Version",
};

function stripAccessControlHeaders(headers: Headers): void {
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith("access-control-")) {
      headers.delete(name);
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
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }

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