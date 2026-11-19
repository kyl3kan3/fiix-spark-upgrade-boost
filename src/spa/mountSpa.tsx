import React from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";

/** Client-only app shell (`/auth`, dashboard, etc.) — not loaded on marketing SSR/hydrate pages. */
export function mountSpa(rootEl: HTMLElement): void {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}