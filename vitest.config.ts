import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl =
    env.VITE_SUPABASE_URL || "https://wwgljhpuulhljumrhscg.supabase.co";
  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";
  const supabaseProjectId = env.VITE_SUPABASE_PROJECT_ID || "wwgljhpuulhljumrhscg";

  return {
  plugins: [react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(supabaseProjectId),
    "import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN": JSON.stringify(env.VITE_PAYMENTS_CLIENT_TOKEN ?? ""),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(env.VITE_APP_VERSION || "test"),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "functions/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["**/*.postbuild.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
};
});
