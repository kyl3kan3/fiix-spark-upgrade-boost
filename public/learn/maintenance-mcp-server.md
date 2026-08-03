# Maintenance MCP Server

> A Model Context Protocol service that exposes controlled maintenance data and actions to compatible AI clients without granting direct database access.

Canonical URL: https://maintenease.com/learn/maintenance-mcp-server

## What is a maintenance MCP server?

A maintenance MCP server is an interface that publishes CMMS capabilities as structured tools for compatible AI clients. Each tool has a name, a purpose, an input schema, and a handler that applies application rules. Typical tools list work orders, find assets, retrieve locations, read maintenance requests, or create a work order. The server sits between the AI client and the maintenance system, so the model does not receive database credentials or invent its own query. This makes MCP a practical boundary for tool-using maintenance assistants and agents.

## The minimum useful tool set

Start small. Read tools should cover the records people ask about most: open work orders, assets, locations, and incoming requests. One carefully constrained write tool can create a pending work order with validated title, priority, due date, description, and asset identifier. Avoid publishing dozens of overlapping tools at launch. Clear names and narrow inputs help the AI select correctly, simplify permission review, and make failures easier to diagnose. New tools should correspond to a real, measured workflow rather than an imagined autonomous future.

## OAuth and user identity

The server should know which person authorized the call. OAuth lets the AI client obtain a scoped token without receiving the user's password. The MCP handler forwards that identity to the CMMS data layer, where normal role and company rules apply. Shared organization-wide credentials weaken accountability because every tool call looks the same and may expose more data than a user should see. Tokens need revocation, expiration, and an issuer the CMMS validates. Authentication proves identity; authorization still determines which records and actions that identity may access.

## Tenant isolation and validation

A multi-tenant CMMS must enforce company boundaries at the database layer as well as in tool code. MaintenEase uses the signed-in token with row-level security so queries remain scoped to the user's company. Write handlers also derive the company and creator from authenticated context rather than accept those sensitive fields from the model. Input schemas should constrain priorities, identifiers, limits, and date formats. The AI may choose arguments, but the server is responsible for rejecting invalid or unauthorized requests.

## Read, write, and destructive annotations

Tool metadata should tell clients whether an operation is read-only, idempotent, or potentially destructive. Listing assets is read-only. Creating a work order changes state but is normally non-destructive. Closing, deleting, or bulk-editing work would carry higher risk and should require stronger confirmation or remain unavailable. These distinctions help AI clients plan safer interactions and help administrators review exposure. Metadata is not a substitute for authorization, validation, and audit logs, but it makes the contract clearer to both software and people.

## Testing a production maintenance MCP service

Test with multiple roles and companies, not only an administrator account. Verify that one tenant cannot retrieve another tenant's assets, malformed identifiers fail cleanly, large limits are capped, and unauthenticated calls return no data. Exercise ambiguous asset names and missing work-order fields. Log tool name, authenticated user, outcome, latency, and record identifier without leaking sensitive content. Finally, test client behavior when the server times out or returns an error: the AI should report the failure, not pretend the maintenance action succeeded.

## FAQ

### What tools should a CMMS MCP server provide?

Begin with narrow tools for work orders, assets, locations, and requests, then add a confirmation-aware work-order creation tool if the read-only pilot is reliable.

### Should an MCP server connect directly to the database?

It should use the application's authenticated data layer and database security policies rather than expose unrestricted database access to the AI client.

### Is OAuth required for a maintenance MCP server?

Individual OAuth is a strong choice for user-facing multi-tenant systems because it preserves identity and revocation. Other environments may use different secure authentication appropriate to their architecture.

### How do I know whether a tool call succeeded?

The server should return an explicit result and record identifier. Clients must surface errors rather than infer success from the original request.

## Sources

- [OpenAI developer documentation](https://developers.openai.com/)
- [OpenAI model documentation showing MCP support](https://developers.openai.com/api/docs/models/gpt-5.6-sol)

## Related

- https://maintenease.com/learn/agentic-cmms
- https://maintenease.com/learn/cmms-for-chatgpt
- https://maintenease.com/learn/ai-work-order-automation
- https://maintenease.com/learn/cmms
