import { classifySeoPath, normalizeSeoPath } from "@/lib/seoRouting";

/**
 * Indexable marketing routes skip Supabase auth entirely until the user hits
 * sign-in, sign-up, or an app route. Auth and app paths bootstrap immediately.
 */
export function shouldDeferAuthBootstrap(pathname: string): boolean {
  const path = normalizeSeoPath(pathname);
  return classifySeoPath(path) === "indexable";
}

export function scheduleIdleTask(task: () => void, timeoutMs = 4000): () => void {
  if (typeof window === "undefined") return () => undefined;

  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    task();
  };

  const onLoad = () => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: timeoutMs });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 1500);
    return () => window.clearTimeout(id);
  };

  let cancelInner: (() => void) | undefined;
  if (document.readyState === "complete") {
    cancelInner = onLoad();
  } else {
    const handler = () => {
      cancelInner = onLoad();
    };
    window.addEventListener("load", handler, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", handler);
      cancelInner?.();
    };
  }

  return () => {
    cancelled = true;
    cancelInner?.();
  };
}