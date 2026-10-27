import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { VitePWA } from "vite-plugin-pwa";
import { PWA_APP_SHELL_NAVIGATE_ALLOWLIST } from "./src/lib/pwaAppShellRoutes";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    "https://wwgljhpuulhljumrhscg.supabase.co";

  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";

  const supabaseProjectId =
    env.VITE_SUPABASE_PROJECT_ID ||
    "wwgljhpuulhljumrhscg";

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
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/wwgljhpuulhljumrhscg\.supabase\.co\/rest\/.*/i,
              handler: "NetworkFirst",
              options: { cacheName: "supabase-api", networkTimeoutSeconds: 8 },
            },
          ],
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
