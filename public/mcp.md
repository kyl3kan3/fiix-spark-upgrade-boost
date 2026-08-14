# Connect ChatGPT and Claude to your CMMS with MCP

> The MaintenEase MCP server gives compatible AI clients a controlled way to read maintenance data and create work orders after a user signs in and approves access. Your database credentials are never shared with the model.

Canonical URL: https://maintenease.com/mcp

MCP endpoint: `https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/mcp`

Server card: https://maintenease.com/.well-known/mcp/server-card.json

Transport: Streamable HTTP

Authorization: OAuth 2.1 with PKCE

## Available tools

- **`list_work_orders`** (Read) — List the signed-in company's work orders and optionally filter them by status.
- **`create_work_order`** (Write) — Create an authorized work order with a title, description, priority, due date, and optional asset.
- **`list_assets`** (Read) — Browse equipment and assets available to the signed-in user's company.
- **`list_locations`** (Read) — List the sites, buildings, rooms, and other locations the company tracks.
- **`list_maintenance_requests`** (Read) — Read the maintenance request inbox before turning a valid request into tracked work.

## Security and access

- **Human-approved access** — OAuth consent keeps the user in control of whether an AI client can connect to MaintenEase.
- **Signed-in identity** — Every tool call carries the authorized user's identity instead of relying on a shared organization credential.
- **Tenant-scoped results** — Database row-level security limits records to the signed-in user's company.
- **Narrow, declared tools** — The client can call only the maintenance actions published by the MCP server and their validated inputs.

## Connection flow

1. **Add the MaintenEase MCP server** — Use the endpoint or server card in an AI client that supports remote MCP servers and OAuth.
2. **Sign in to MaintenEase** — The client opens the MaintenEase authorization flow without receiving the user's password.
3. **Review and approve access** — The user confirms the connection before the client receives an access token.
4. **Use maintenance tools** — The AI client can select an available tool while MaintenEase continues to enforce user and company permissions.

## FAQ

### What is the MaintenEase MCP server?

It is a Model Context Protocol service that publishes controlled CMMS tools for compatible AI clients. It can list work orders, assets, locations, and maintenance requests and can create a work order after user authorization.

### Can ChatGPT or Claude connect to MaintenEase?

They can connect when the relevant product, plan, and workspace policy support remote OAuth-authenticated MCP servers. Availability and setup controls can vary by AI client.

### Does the AI client receive database credentials?

No. The client receives a revocable OAuth access token after user consent. MaintenEase applies the signed-in user's permissions and tenant-scoped data rules to every tool call.

### Can an AI client create work orders?

Yes. The create_work_order tool accepts a narrow, validated set of fields. The work order is created for the signed-in user's company and records that user as its creator.

### Where can an AI crawler find the machine-readable details?

Use the MCP server card, the clean Markdown version of this page, llms.txt, llms-full.txt, and the structured AI catalog at /api/ai.json.

## Machine-readable resources

- [MCP server card](https://maintenease.com/.well-known/mcp/server-card.json)
- [Authentication documentation](https://maintenease.com/auth.md)
- [Concise AI index](https://maintenease.com/llms.txt)
- [Full AI corpus](https://maintenease.com/llms-full.txt)
- [Structured AI catalog](https://maintenease.com/api/ai.json)
