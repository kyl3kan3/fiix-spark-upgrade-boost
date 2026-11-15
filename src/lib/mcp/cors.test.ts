import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { wrapMcpHandler } from "../../../supabase/functions/mcp/corsWrap";

const endpoint = "https://example.test/functions/v1/mcp";
const handler = wrapMcpHandler(() => new Response("Unauthorized", {
  status: 401,
  headers: { "Access-Control-Allow-Origin": "*", "WWW-Authenticate": "Bearer" },
}));

describe("MCP shared origin allowlist", () => {
  it.each([
    "https://maintenease.com",
    "https://www.maintenease.com",
    "https://maintenease.lovable.app",
    "https://id-preview--8e4b0baf-d26e-4fdc-947e-b3bad90e188b.lovable.app",
  ])("echoes trusted origin %s for preflight and OAuth errors", async (origin) => {
    for (const method of ["OPTIONS", "POST"]) {
      const response = await handler(new Request(endpoint, { method, headers: { Origin: origin } }));
      expect(response.status).toBe(method === "OPTIONS" ? 204 : 401);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Vary")).toContain("Origin");
      if (method === "POST") expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
    }
  });

  it.each(["https://untrusted.example", "https://maintenease.com.evil.example"])(
    "removes wildcard permission for untrusted origin %s", async (origin) => {
      for (const method of ["OPTIONS", "POST"]) {
        const response = await handler(new Request(endpoint, { method, headers: { Origin: origin } }));
        expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
        expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
      }
    },
  );

  it("preserves originless clients and OAuth requirements without wildcard CORS", async () => {
    const response = await handler(new Request(endpoint, { method: "POST" }));
    expect(response.status).toBe(401);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(await response.text()).toBe("Unauthorized");
  });

  it("allows MCP protocol and session headers on trusted preflights", async () => {
    const response = await handler(new Request(endpoint, {
      method: "OPTIONS", headers: { Origin: "https://maintenease.com" },
    }));
    const allowed = response.headers.get("Access-Control-Allow-Headers")?.toLowerCase();
    for (const header of ["authorization", "content-type", "mcp-session-id", "mcp-protocol-version", "last-event-id"]) {
      expect(allowed).toContain(header);
    }
  });

  it("keeps both SDK emitters wired to the shared CORS wrapper", () => {
    for (const extension of ["js", "cjs"]) {
      const emitter = readFileSync(`node_modules/@lovable.dev/mcp-js/dist/stacks/supabase/vite.${extension}`, "utf8");
      expect(emitter).toContain("Deno.serve(wrapMcpHandler(createSupabaseHandler(");
    }
  });
});