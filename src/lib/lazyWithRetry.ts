import { lazy, type ComponentType } from "react";

/**
 * lazy() wrapper that recovers from "Failed to fetch dynamically imported
 * module" errors. These typically occur right after a deploy: the user's
 * SPA shell references chunk hashes (e.g. `ForgotPassword-D5JfWo80.js`)
 * that no longer exist on the server. A single hard reload pulls the new
 * index.html and its current chunk hashes, fixing the issue.
 *
 * We guard against reload loops with a sessionStorage flag — if the
 * reload itself fails to recover, the original error is re-thrown so the
 * ErrorBoundary can show a fallback.
 */
const RELOAD_FLAG = "lovable.chunk-reload-attempted";

function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's own ComponentType<any> constraint
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(RELOAD_FLAG);
      } catch {
        // ignore — storage may be unavailable
      }
      return mod;
    } catch (err) {
      if (isChunkLoadError(err)) {
        let alreadyTried = false;
        try {
          alreadyTried = sessionStorage.getItem(RELOAD_FLAG) === "1";
        } catch {
          // ignore
        }
        if (!alreadyTried && typeof window !== "undefined") {
          try {
            sessionStorage.setItem(RELOAD_FLAG, "1");
          } catch {
            // ignore
          }
          window.location.reload();
          // Suspend forever — the reload will replace the page.
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
}