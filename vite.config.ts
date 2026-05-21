import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split heavy third-party libs out of the main bundle so the
        // initial download is smaller and vendors cache independently
        // from app code.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react-router")) return "vendor-router";
          if (
            id.includes("/react-dom") ||
            id.includes("/scheduler/") ||
            id.includes("/react/") ||
            id.includes("/react/jsx-runtime") ||
            id.includes("/react/jsx-dev-runtime")
          ) return "vendor-react";
          if (id.includes("/@supabase/")) return "vendor-supabase";
          if (id.includes("/recharts/") || id.includes("/d3-")) return "vendor-charts";
          if (id.includes("/jspdf") || id.includes("/html2canvas")) return "vendor-pdf";
          if (id.includes("/xlsx") || id.includes("/papaparse") || id.includes("/mammoth")) return "vendor-docs";
          if (id.includes("/pdfjs-dist")) return "vendor-pdfjs";
          if (id.includes("/tesseract.js")) return "vendor-ocr";
          if (id.includes("/@radix-ui/")) return "vendor-radix";
          if (id.includes("/react-joyride") || id.includes("/react-floater")) return "vendor-joyride";
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    // Always re-bundle deps on dev server startup to avoid stale
    // ".vite/deps" chunks causing "Importing a module script failed".
    force: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
