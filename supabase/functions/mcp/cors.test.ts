import { assertEquals, assertNotEquals } from "jsr:@std/assert@1";
import {
  applyMcpCors,
  handleMcpCorsPreflight,
  wrapMcpHandler,
} from "./corsWrap.ts";

Deno.test("allowed origin is echoed with Vary", () => {
  const req = new Request("https://example.test/mcp", {
    headers: { Origin: "https://maintenease.com" },
  });
  const inner = new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
  const res = applyMcpCors(req, inner);
  assertEquals(
    res.headers.get("Access-Control-Allow-Origin"),
    "https://maintenease.com",
  );
  assertEquals(res.headers.get("Vary"), "Origin");
  assertEquals(
    res.headers.get("Access-Control-Allow-Credentials"),
    "true",
  );
});

Deno.test("disallowed origin gets no Access-Control-Allow-Origin", () => {
  const req = new Request("https://example.test/mcp", {
    headers: { Origin: "https://evil.example" },
  });
  const inner = new Response("{}", {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
  const res = applyMcpCors(req, inner);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("request without Origin is still served and strips wildcard CORS", async () => {
  const handler = wrapMcpHandler(() =>
    new Response(JSON.stringify({ tools: [] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  );
  const req = new Request("https://example.test/mcp", { method: "POST" });
  const res = await handler(req);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
  const body = await res.json();
  assertEquals(body, { tools: [] });
});

Deno.test("OPTIONS preflight returns 204 with allowlist CORS", async () => {
  const req = new Request("https://example.test/mcp", {
    method: "OPTIONS",
    headers: { Origin: "https://www.maintenease.com" },
  });
  const res = handleMcpCorsPreflight(req);
  assertNotEquals(res, null);
  assertEquals(res!.status, 204);
  assertEquals(await res!.text(), "");
  assertEquals(
    res!.headers.get("Access-Control-Allow-Origin"),
    "https://www.maintenease.com",
  );
  assertEquals(res!.headers.get("Vary"), "Origin");
});

Deno.test("OPTIONS with disallowed origin returns 204 without ACAO", () => {
  const req = new Request("https://example.test/mcp", {
    method: "OPTIONS",
    headers: { Origin: "https://evil.example" },
  });
  const res = handleMcpCorsPreflight(req)!;
  assertEquals(res.status, 204);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("OPTIONS allow-headers includes MCP session headers", () => {
  const req = new Request("https://example.test/mcp", {
    method: "OPTIONS",
    headers: { Origin: "https://maintenease.com" },
  });
  const res = handleMcpCorsPreflight(req)!;
  const allowHeaders = res.headers.get("Access-Control-Allow-Headers") ?? "";
  assertEquals(allowHeaders.includes("Mcp-Session-Id"), true);
  assertEquals(allowHeaders.includes("Mcp-Protocol-Version"), true);
  assertEquals(allowHeaders.includes("Last-Event-ID"), true);
});

Deno.test("strips lowercase library Access-Control-Allow-Origin wildcard", () => {
  const req = new Request("https://example.test/mcp", {
    headers: { Origin: "https://evil.example" },
  });
  const inner = new Response("{}", {
    headers: new Headers([["access-control-allow-origin", "*"]]),
  });
  const res = applyMcpCors(req, inner);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("merges Vary with existing response Vary", () => {
  const req = new Request("https://example.test/mcp", {
    headers: { Origin: "https://maintenease.com" },
  });
  const inner = new Response("{}", {
    headers: { Vary: "Accept-Encoding" },
  });
  const res = applyMcpCors(req, inner);
  const vary = res.headers.get("Vary") ?? "";
  assertEquals(vary.includes("Origin"), true);
  assertEquals(vary.includes("Accept-Encoding"), true);
});