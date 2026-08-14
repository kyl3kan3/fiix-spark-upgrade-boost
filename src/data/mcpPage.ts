export const MCP_PAGE = {
  metaTitle: "MaintenEase MCP Server for ChatGPT & Claude",
  metaDescription:
    "Connect ChatGPT, Claude, and compatible AI clients to MaintenEase through an OAuth-secured MCP server for work orders, assets, locations, and requests.",
  h1: "Connect ChatGPT and Claude to your CMMS with MCP",
  intro:
    "The MaintenEase MCP server gives compatible AI clients a controlled way to read maintenance data and create work orders after a user signs in and approves access. Your database credentials are never shared with the model.",
  endpoint: "https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/mcp",
  serverCardUrl: "https://maintenease.com/.well-known/mcp/server-card.json",
  authDocumentationUrl: "https://maintenease.com/auth.md",
  markdownUrl: "https://maintenease.com/mcp.md",
  protocol: "Streamable HTTP",
  authorization: "OAuth 2.1 with PKCE",
  updated: "2026-08-14",
  tools: [
    {
      name: "list_work_orders",
      title: "Review work orders",
      description: "List the signed-in company's work orders and optionally filter them by status.",
      access: "Read",
    },
    {
      name: "create_work_order",
      title: "Create a work order",
      description: "Create an authorized work order with a title, description, priority, due date, and optional asset.",
      access: "Write",
    },
    {
      name: "list_assets",
      title: "Find tracked assets",
      description: "Browse equipment and assets available to the signed-in user's company.",
      access: "Read",
    },
    {
      name: "list_locations",
      title: "Find buildings and rooms",
      description: "List the sites, buildings, rooms, and other locations the company tracks.",
      access: "Read",
    },
    {
      name: "list_maintenance_requests",
      title: "Review incoming requests",
      description: "Read the maintenance request inbox before turning a valid request into tracked work.",
      access: "Read",
    },
  ],
  safeguards: [
    {
      title: "Human-approved access",
      description: "OAuth consent keeps the user in control of whether an AI client can connect to MaintenEase.",
    },
    {
      title: "Signed-in identity",
      description: "Every tool call carries the authorized user's identity instead of relying on a shared organization credential.",
    },
    {
      title: "Tenant-scoped results",
      description: "Database row-level security limits records to the signed-in user's company.",
    },
    {
      title: "Narrow, declared tools",
      description: "The client can call only the maintenance actions published by the MCP server and their validated inputs.",
    },
  ],
  steps: [
    {
      title: "Add the MaintenEase MCP server",
      description: "Use the endpoint or server card in an AI client that supports remote MCP servers and OAuth.",
    },
    {
      title: "Sign in to MaintenEase",
      description: "The client opens the MaintenEase authorization flow without receiving the user's password.",
    },
    {
      title: "Review and approve access",
      description: "The user confirms the connection before the client receives an access token.",
    },
    {
      title: "Use maintenance tools",
      description: "The AI client can select an available tool while MaintenEase continues to enforce user and company permissions.",
    },
  ],
  faqs: [
    {
      q: "What is the MaintenEase MCP server?",
      a: "It is a Model Context Protocol service that publishes controlled CMMS tools for compatible AI clients. It can list work orders, assets, locations, and maintenance requests and can create a work order after user authorization.",
    },
    {
      q: "Can ChatGPT or Claude connect to MaintenEase?",
      a: "They can connect when the relevant product, plan, and workspace policy support remote OAuth-authenticated MCP servers. Availability and setup controls can vary by AI client.",
    },
    {
      q: "Does the AI client receive database credentials?",
      a: "No. The client receives a revocable OAuth access token after user consent. MaintenEase applies the signed-in user's permissions and tenant-scoped data rules to every tool call.",
    },
    {
      q: "Can an AI client create work orders?",
      a: "Yes. The create_work_order tool accepts a narrow, validated set of fields. The work order is created for the signed-in user's company and records that user as its creator.",
    },
    {
      q: "Where can an AI crawler find the machine-readable details?",
      a: "Use the MCP server card, the clean Markdown version of this page, llms.txt, llms-full.txt, and the structured AI catalog at /api/ai.json.",
    },
  ],
  related: [
    { label: "How a maintenance MCP server works", href: "/learn/maintenance-mcp-server" },
    { label: "Connect a CMMS to ChatGPT", href: "/learn/cmms-for-chatgpt" },
    { label: "What is an agentic CMMS?", href: "/learn/agentic-cmms" },
  ],
} as const;
