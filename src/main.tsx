
import "./index.css";
import { initSentry } from "./lib/sentry";
import { STATIC_SEO_FOOTER_ID } from "./lib/staticSeoFooter";
import { shouldHydrateMarketingPage } from "./lib/marketingHydration";

initSentry();
document.getElementById(STATIC_SEO_FOOTER_ID)?.remove();
if (typeof navigator !== "undefined" && "modelContext" in navigator) {
  void import("./lib/webmcp").then(({ initWebMcp }) => initWebMcp());
}

// Recover from stale dynamic-import chunks after a deploy.
// When Vite can't load a module hash that no longer exists, force one reload.
if (typeof window !== "undefined") {
  const RELOAD_KEY = "__chunk_reload_attempt";
  const isChunkLoadError = (msg: string) =>
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg);

  const tryReload = () => {
    try {
      const attempted = sessionStorage.getItem(RELOAD_KEY);
      if (attempted) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    } catch {
      // sessionStorage unavailable — skip auto-reload to avoid loops
    }
  };

  window.addEventListener("error", (e) => {
    if (e?.message && isChunkLoadError(e.message)) tryReload();
  });
  window.addEventListener("unhandledrejection", (e) => {
    const msg = (e?.reason && (e.reason.message || String(e.reason))) || "";
    if (isChunkLoadError(msg)) tryReload();
  });
}

if (import.meta.env.PROD && typeof window !== "undefined") {
  const registerPwa = () => {
    void import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({ immediate: true });
    });
  };
  if (document.readyState === "complete") {
    window.setTimeout(registerPwa, 1500);
  } else {
    window.addEventListener("load", () => window.setTimeout(registerPwa, 1500), { once: true });
  }
}

const rootEl = document.getElementById("root");

async function mountMarketingHydrate(): Promise<void> {
  if (!rootEl) return;
  const { preloadMarketingRoute } = await import("./ssr/preloadMarketingRoute");
  await preloadMarketingRoute(window.location.pathname);
  const { renderMarketingHydrate } = await import("./marketing/renderMarketingHydrate");
  renderMarketingHydrate(rootEl);
}

async function mountSpaApp(): Promise<void> {
  if (!rootEl) return;
  const { mountSpa } = await import("./spa/mountSpa");
  mountSpa(rootEl);
}

async function mount(): Promise<void> {
  if (!rootEl) return;
  if (shouldHydrateMarketingPage(window.location.pathname, rootEl)) {
    await mountMarketingHydrate();
    return;
  }
  await mountSpaApp();
}

void mount();