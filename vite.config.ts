import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { VitePWA } from "vite-plugin-pwa";
import { PWA_APP_SHELL_NAVIGATE_ALLOWLIST } from "./src/lib/pwaAppShellRoutes";

const SUPABASE_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

function assertSupabaseEnvForBuild(env: Record<string, string>): void {
  const missing = SUPABASE_ENV_KEYS.filter((key) => !env[key]?.trim());
  if (missing.length === 0) return;

  throw new Error(
    `Missing required Supabase environment variables for production build:\n` +
      missing.map((key) => `  - ${key}`).join("\n") +
      `\n\nSet them in the environment or a .env file (see .env.example). ` +
      `CI uses placeholders in .github/workflows/ci.yml.`,
  );
}

function supabaseRestCachePattern(supabaseUrl: string): RegExp | null {
  const base = supabaseUrl.trim().replace(/\/$/, "");
  if (!base) return null;
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}/rest/.*`, "i");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const isProductionBuild = mode === "production";
  if (isProductionBuild) {
    assertSupabaseEnvForBuild(env);
  }

  const supabaseUrl = env.VITE_SUPABASE_URL?.trim() ?? "";
  const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const supabaseProjectId = env.VITE_SUPABASE_PROJECT_ID?.trim() ?? "";

  const supabaseRestPattern = supabaseRestCachePattern(supabaseUrl);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      // Keep bundled files away from the application's /assets route so edge
      // rewrites can serve /assets/:id from the protected app shell.
      assetsDir: "static",
      sourcemap: true,
      rollupOptions: {
        output: {
          // Split long-lived vendor code out of the entry chunk so it caches
          // across deploys and downloads in parallel. App code changes every
          // deploy; react/supabase change on dependency bumps only.
          manualChunks(id) {
            const moduleId = id.replaceAll("\\", "/");
            if (
              moduleId.includes("/node_modules/react/") ||
              moduleId.includes("/node_modules/react-dom/") ||
              moduleId.includes("/node_modules/react-router-dom/") ||
              moduleId.includes("/node_modules/@tanstack/react-query/")
            ) {
              return "vendor-react";
            }
            if (moduleId.includes("/node_modules/@supabase/")) {
              return "vendor-supabase";
            }
          },
        },
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(supabaseProjectId),
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(
        env.VITE_APP_VERSION || new Date().toISOString()
      ),
    },
    optimizeDeps: {
      // Always re-bundle deps on dev server startup to avoid stale
      // ".vite/deps" chunks causing "Importing a module script failed".
      force: true,
    },
    plugins: [
      react(),
      mcpPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.png",
          "pwa-icon-192.png",
          "pwa-icon-512.png",
          "pwa-icon-maskable-512.png",
        ],
        manifest: {
          name: "MaintenEase",
          short_name: "MaintenEase",
          description: "Maintenance work orders and assets",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/dashboard",
          icons: [
            {
              src: "/pwa-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // index.html is emitted and precached during `vite build`; app-shell.html
          // is written in postbuild prerender and is not in the precache manifest.
          navigateFallback: "/index.html",
          navigateFallbackAllowlist: PWA_APP_SHELL_NAVIGATE_ALLOWLIST,
          globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
          runtimeCaching: supabaseRestPattern
            ? [
                {
                  urlPattern: supabaseRestPattern,
                  handler: "NetworkFirst",
                  options: { cacheName: "supabase-api", networkTimeoutSeconds: 8 },
                },
              ]
            : [],
        },
      }),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
