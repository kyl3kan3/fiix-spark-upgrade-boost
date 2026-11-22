import { classifySeoPath, normalizeSeoPath } from "@/lib/seoRouting";

/**
 * Indexable marketing routes skip Supabase auth entirely until the user hits
 * sign-in, sign-up, or an app route. Auth and app paths bootstrap immediately.
 */
export function shouldDeferAuthBootstrap(pathname: string): boolean {
  const path = normalizeSeoPath(pathname);
  return classifySeoPath(path) === "indexable";
}

const readInitialWindowLoadCompleted = (): boolean => {
  if (typeof window === "undefined") return false;

  if (typeof performance !== "undefined" && typeof performance.getEntriesByType === "function") {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigationEntry) {
      return navigationEntry.loadEventEnd > 0;
    }
  }

  return typeof document !== "undefined" && document.readyState === "complete";
};

let windowLoadCompleted = readInitialWindowLoadCompleted();

let windowLoadGateListenerAttached = false;

const attachWindowLoadGateListener = (): void => {
  if (typeof window === "undefined" || windowLoadGateListenerAttached || windowLoadCompleted) {
    return;
  }
  windowLoadGateListenerAttached = true;
  window.addEventListener(
    "load",
    () => {
      windowLoadCompleted = true;
      windowLoadGateListenerAttached = false;
    },
    { once: true },
  );
};

if (typeof window !== "undefined" && !windowLoadCompleted) {
  attachWindowLoadGateListener();
}

/** True after the window `load` event (or already past load at module init). */
export function hasWindowLoadCompleted(): boolean {
  return windowLoadCompleted;
}

/** Reset load gate and re-attach listener (tests only). */
export function resetWindowLoadGateForTests(): void {
  windowLoadCompleted = false;
  windowLoadGateListenerAttached = false;
  attachWindowLoadGateListener();
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
  if (hasWindowLoadCompleted()) {
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