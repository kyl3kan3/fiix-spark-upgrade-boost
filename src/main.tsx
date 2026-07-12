
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry } from "./lib/sentry";

initSentry();

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

ReactDOM.createRoot(document.getElementById("root")!).render(
 <React.StrictMode>
 <App />
 </React.StrictMode>
);
