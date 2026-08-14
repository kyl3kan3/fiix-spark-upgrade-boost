# MaintenEase — Agent Authentication

MaintenEase is a CMMS (work orders, assets, preventive maintenance, inspections).
Agents access customer data through the MaintenEase MCP server, which is protected
by OAuth 2.1 with human-delegated consent. There is no anonymous data access.

## Endpoints

- MCP server: `https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/mcp`
- Protected resource metadata: `/.well-known/oauth-protected-resource`
- Authorization server metadata: `/.well-known/oauth-authorization-server`
- OpenID configuration: `/.well-known/openid-configuration`
- MCP server card: `/.well-known/mcp/server-card.json`
- API catalog: `/.well-known/api-catalog`

## Registration

Dynamic Client Registration (RFC 7591) is supported:

```
POST https://wwgljhpuulhljumrhscg.supabase.co/auth/v1/oauth/clients/register
```

Identity types: human-delegated only. Credential type: OAuth 2.1 access token
(authorization code + PKCE `S256`). Refresh tokens are issued.

## Flow

1. Register (or reuse) an OAuth client.
2. Send the user to the authorization endpoint with PKCE.
3. The user signs in to MaintenEase and approves the connection on the in-app consent screen.
4. Exchange the code at the token endpoint.
5. Call the MCP endpoint with `Authorization: Bearer <access_token>`.

Access is scoped by the signed-in user's company; row-level security enforces
tenant isolation. Users revoke access from their MaintenEase account settings.

## Public content

Unauthenticated agents can read marketing and reference content:
`https://maintenease.com/llms.txt`, `https://maintenease.com/llms-full.txt`,
`https://maintenease.com/mcp`, `https://maintenease.com/mcp.md`, and
`https://maintenease.com/api/ai.json`.
