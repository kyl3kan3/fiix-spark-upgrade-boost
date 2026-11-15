# Project rules

- Keep subscription recovery destinations compatible with role-based route restrictions in `ProtectedRoute`; routing a restricted user to another gated page creates redirect cycles.
- Work-order AI summaries are explicitly requested from a caller-RLS-scoped edge function using streamed AI Gateway Responses; this avoids cross-company exposure and automatic per-view spending.