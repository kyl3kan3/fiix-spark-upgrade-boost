import { defineConfig, mergeConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) => {
  const base =
    typeof viteConfig === "function" ? viteConfig(configEnv) : viteConfig;
  const env = loadEnv(configEnv.mode, process.cwd(), "");

  return mergeConfig(
    {
      plugins: [react()],
      define: base.define,
      resolve: base.resolve ?? {
        alias: { "@": path.resolve(__dirname, "./src") },
      },
    },
    {
      define: {
        "import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN": JSON.stringify(
          env.VITE_PAYMENTS_CLIENT_TOKEN ?? "",
        ),
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(
          env.VITE_APP_VERSION || "test",
        ),
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
    },
  );
});