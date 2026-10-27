/**
 * Authenticated app routes (Vercel/edge serve app-shell). The service worker
 * navigate fallback applies only to these — not marketing/prerender pages.
 * Keep in sync with vercel.json app-shell `src` and public/_redirects.
 */
export const PWA_APP_SHELL_ROUTE_SEGMENTS = [
  "auth",
  "forgot-password",
  "reset-password",
  "unsubscribe",
  "requests",
  "dashboard",
  "vendors",
  "assets",
  "work-orders",
  "inspections",
  "checklists",
  "admin",
  "notifications",
  "settings",
  "calendar",
  "maintenance",
  "predictive-maintenance",
  "self-healing",
  "cost-tracking",
  "lubricants",
  "parts",
  "purchasing",
  "maintenance-codes",
  "scan",
  "onboarding",
  "power-usage",
  "assistant",
  "guided-setup",
  "building-viewer",
  "import",
  "team",
  "locations",
  "profile",
  "help",
  "chat",
  "reports",
  "billing",
  "automations",
  "api-keys",
  "sso",
  "setup",
  "team-setup",
  "company-setup",
] as const;

const appShellPathRegex = new RegExp(
  `^/(${PWA_APP_SHELL_ROUTE_SEGMENTS.join("|")})(/|$)`,
);

/** Workbox navigateFallbackAllowlist entries for vite-plugin-pwa. */
export const PWA_APP_SHELL_NAVIGATE_ALLOWLIST: RegExp[] = [
  /^\/\.lovable\/oauth\/consent$/,
  appShellPathRegex,
];
