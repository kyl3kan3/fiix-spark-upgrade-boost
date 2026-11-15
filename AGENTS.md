# Project rules

- Keep subscription recovery destinations compatible with role-based route restrictions in `ProtectedRoute`; routing a restricted user to another gated page creates redirect cycles.
- Work-order AI summaries are explicitly requested from a caller-RLS-scoped edge function using streamed AI Gateway Responses; this avoids cross-company exposure and automatic per-view spending.
- Verify the existing MCP SDK CORS patch before Vite emits the SDK-owned function; dependency restores may skip postinstall and otherwise restore wildcard CORS instead of the shared allowlist.