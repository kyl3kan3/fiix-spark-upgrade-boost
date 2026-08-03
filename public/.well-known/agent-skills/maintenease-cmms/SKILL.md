---
name: maintenease-cmms
description: Connect to MaintenEase, a CMMS, to list and create work orders, browse assets and locations, and read the maintenance request inbox for the signed-in user's company.
---

# MaintenEase CMMS

Use this skill when a user asks about maintenance work orders, equipment/assets,
sites and locations, or incoming maintenance requests in MaintenEase.

## Connect

MaintenEase exposes a remote MCP server:

```
https://wwgljhpuulhljumrhscg.supabase.co/functions/v1/mcp
```

Transport: Streamable HTTP. Auth: OAuth 2.1 (authorization code + PKCE, dynamic
client registration supported). See https://maintenease.com/auth.md.

## Tools

- `list_work_orders` — list work orders, optional `status` filter (`pending`, `in_progress`, `completed`, `cancelled`) and `limit`.
- `create_work_order` — create a work order (`title` required; optional `description`, `priority`, `due_date`, `asset_id`).
- `list_assets` — list tracked equipment/assets, optional `search` and `limit`.
- `list_locations` — list buildings, sites, and rooms.
- `list_maintenance_requests` — read the incoming request inbox.

## Notes

All calls act as the signed-in user and are scoped to their company by
row-level security. Never ask users for passwords or tokens — use the OAuth flow.
