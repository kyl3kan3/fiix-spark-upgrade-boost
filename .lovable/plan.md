## Problem

On a Chrome Mobile WebView (Android 12), `localStorage` is `null` (not undefined), so `localStorage.getItem(...)` throws `Cannot read properties of null (reading 'getItem')`. This crashes the `/auth` route via the error boundary. The current `typeof window !== "undefined"` guard does not catch this case because `window` exists but `window.localStorage` is null/blocked (private mode, restricted WebView, or storage disabled).

## Fix

Update `src/components/auth/InviteMessage.tsx` to safely read/write localStorage:

1. Add a small helper `safeGetItem(key)` that returns `null` if `window`, `localStorage`, or the call throws. Wrap access in `try/catch`.
2. Use it for the two `useState` initializers (token, company).
3. Use it inside the `storage` event handler too.
4. No other behavior changes; component still renders nothing when no token.

## Technical notes

```ts
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
```

Scope is limited to this single file — the only one flagged by the Sentry stack trace. Other localStorage usages can be hardened separately if they show up in Sentry.
