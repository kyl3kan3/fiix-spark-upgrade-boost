import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

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
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
