import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Match .github/workflows/ci.yml placeholders — no real keys in source.
const testEnv = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? "https://example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "build-only-placeholder",
  VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? "example",
  VITE_PAYMENTS_CLIENT_TOKEN: process.env.VITE_PAYMENTS_CLIENT_TOKEN ?? "",
  VITE_APP_VERSION: process.env.VITE_APP_VERSION ?? "test",
};

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(testEnv.VITE_SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      testEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      testEnv.VITE_SUPABASE_PROJECT_ID,
    ),
    "import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN": JSON.stringify(
      testEnv.VITE_PAYMENTS_CLIENT_TOKEN,
    ),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(testEnv.VITE_APP_VERSION),
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
});