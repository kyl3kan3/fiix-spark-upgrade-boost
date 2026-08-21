// WebMCP (https://webmachinelearning.github.io/webmcp/) — expose a few safe,
// public MaintenEase actions to browser-resident AI agents. Nothing here reads
// or writes customer data; authenticated data access goes through the MCP
// server advertised in /.well-known/mcp/server-card.json.

import {
  PLAN_CAPACITY_SUMMARY,
  PRODUCT_BILLING_SUMMARY,
  PRODUCT_PLANS,
  PRODUCT_SUPPORT_SUMMARY,
  PRODUCT_TRIAL_SUMMARY,
} from "@/data/productCatalog";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<{ content: { type: "text"; text: string }[] }>;
};

type ModelContext = { provideContext: (ctx: { tools: WebMcpTool[] }) => void };

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });

const tools: WebMcpTool[] = [
  {
    name: "get_pricing",
    description: "Get MaintenEase plan names, monthly prices, seat allowances, and trial terms.",
    inputSchema: { type: "object", properties: {} },
    execute: async () =>
      text(
        `${PRODUCT_PLANS.map((plan) => {
          const extraSeat = plan.extraSeatMonthlyPrice
            ? `; additional seats $${plan.extraSeatMonthlyPrice}/mo each`
            : "";
          return `${plan.name}: $${plan.monthlyPrice}/mo or $${plan.annualPrice}/yr (${plan.includedSeats} seats included${extraSeat})`;
        }).join("\n")}\n${PLAN_CAPACITY_SUMMARY}\n${PRODUCT_TRIAL_SUMMARY}\n${PRODUCT_BILLING_SUMMARY}\n${PRODUCT_SUPPORT_SUMMARY}`
      ),
  },
  {
    name: "connect_ai_assistant",
    description: "Get the MaintenEase MCP server endpoint and auth details so an AI assistant can connect to a customer's CMMS data.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      const res = await fetch("/.well-known/mcp/server-card.json", { headers: { Accept: "application/json" } });
      return text(await res.text());
    },
  },
  {
    name: "search_maintenease_docs",
    description: "Search MaintenEase public guides and comparison pages for a topic (CMMS, preventive maintenance, MTBF, work orders, etc.).",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Topic or keyword to look for." } },
      required: ["query"],
    },
    execute: async ({ query }) => {
      const res = await fetch("/llms.txt", { headers: { Accept: "text/plain" } });
      const corpus = await res.text();
      const q = String(query ?? "").toLowerCase();
      const hits = corpus
        .split("\n")
        .filter((line) => line.toLowerCase().includes(q))
        .slice(0, 20);
      return text(hits.length ? hits.join("\n") : `No matches for "${query}". Full index: https://maintenease.com/llms-full.txt`);
    },
  },
  {
    name: "open_page",
    description: "Navigate the MaintenEase site to a path such as /pricing, /features, or /learn/preventive-maintenance.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Same-origin path beginning with /." } },
      required: ["path"],
    },
    execute: async ({ path }) => {
      const raw = String(path ?? "");
      if (!raw.startsWith("/") || raw.startsWith("//")) return text("Rejected: path must be a same-origin path starting with /.");
      window.location.assign(raw);
      return text(`Navigating to ${raw}`);
    },
  },
];

export function initWebMcp() {
  try {
    const ctx = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    ctx?.provideContext({ tools });
  } catch {
    // WebMCP is progressive enhancement — never break the app.
  }
}
