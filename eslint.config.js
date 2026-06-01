import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Architectural-boundary guards. Each is the *mechanical prevention* for a
// missing-owner item in the refactor backlog. They land in "warn" so CI stays
// green while `npm run lint` self-lists the migration worklist; flip a guard to
// "error" once its count hits zero (mirrors the existing no-explicit-any glide).
const SUPABASE_CLIENT_MESSAGE =
  "Import the Supabase client only inside src/services/** or src/integrations/**. " +
  "Components, hooks, and pages should go through a domain service " +
  "(see src/services/assetService.ts) consumed via a react-query hook.";

const AUTH_OWNER_MESSAGE =
  "Resolve the current user/company through src/services/supabaseHelpers.ts " +
  "(requireUserCompany / tryGetUserCompany / getCurrentUser / requireUser) " +
  "instead of calling supabase.auth.getUser()/getSession() directly.";

// `supabase.auth.getUser()` / `supabase.auth.getSession()` call expressions.
const AUTH_CALL_SELECTOR =
  "CallExpression[callee.object.object.name='supabase']" +
  "[callee.object.property.name='auth']" +
  "[callee.property.name=/^(getUser|getSession)$/]";

export default tseslint.config(
  { ignores: ["dist", "supabase/functions"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // "warn" with the conventional underscore-prefix escape for
      // intentionally-unused callback args.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Downgraded to warn: ~300 pre-existing occurrences. Paid down
      // incrementally in later refactor phases; keeps CI lint green.
      "@typescript-eslint/no-explicit-any": "warn",

      // Item 1 — data-access boundary (warn → error once the 88 importers
      // outside the service layer reach zero).
      "no-restricted-imports": [
        "warn",
        { paths: [{ name: "@/integrations/supabase/client", message: SUPABASE_CLIENT_MESSAGE }] },
      ],

      // Item 2 — auth/company owner (warn → error once the inline call sites
      // reach zero).
      "no-restricted-syntax": [
        "warn",
        { selector: AUTH_CALL_SELECTOR, message: AUTH_OWNER_MESSAGE },
      ],

      // Cross-cutting — logging boundary. console.error stays the escape hatch;
      // log/warn/info/debug must route through src/lib/logger.ts.
      "no-console": ["error", { allow: ["error"] }],
    },
  },
  // The service and integration layers *own* data access — the client ban and
  // the auth-call ban do not apply there.
  {
    files: ["src/services/**", "src/integrations/**"],
    rules: { "no-restricted-imports": "off" },
  },
  // supabaseHelpers.ts is the one module allowed to call supabase.auth.* — it is
  // the owner the rest of the codebase routes through.
  {
    files: ["src/services/supabaseHelpers.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  // logger.ts is the one module allowed to touch console directly.
  {
    files: ["src/lib/logger.ts"],
    rules: { "no-console": "off" },
  },
  // scripts/** are Node CLI tools whose stdout is the product, not app code
  // subject to the runtime boundaries above.
  {
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
);
