#!/usr/bin/env node
/**
 * Structural guards for src/.
 *
 * Locks in the conventions established by the architecture-audit cleanups so
 * future churn doesn't quietly undo them. Each check is independently
 * actionable; the script reports every violation it finds before exiting,
 * so one CI run lists the full punch list.
 *
 * Checks:
 *   1. Banned directories — `src/contexts/`, `src/lov-sql/` must not come back.
 *   2. Feature-folder coherence — if `src/features/<X>/` exists, the same
 *      <X> must not also live under `src/components/<X>/`, `src/hooks/<X>/`,
 *      or `src/services/<X>/` (splits the feature again).
 *   3. Page size ratchet — `src/pages/*.tsx` files capped at PAGE_LINE_CEILING
 *      lines. Catches megapages (e.g. AdminAnalyticsPage at 685) before they
 *      land. Lower the ceiling as pages are split to lock the win in.
 *   4. AppProviders adoption — `src/App.tsx` must import `@/providers/AppProviders`
 *      (i.e. it can't go back to hand-rolling the provider pyramid inline).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PAGE_LINE_CEILING = 800;

const violations = [];

// 1. Banned directories
const BANNED_DIRS = ["src/contexts", "src/lov-sql"];
for (const dir of BANNED_DIRS) {
  if (existsSync(dir)) {
    violations.push(
      `Banned directory exists: ${dir}/ — these were consolidated/removed in the architecture audit and should not return.`,
    );
  }
}

// 2. Feature-folder coherence — no shadow domain dirs alongside features/
if (existsSync("src/features")) {
  const featureDomains = readdirSync("src/features").filter((d) =>
    statSync(join("src/features", d)).isDirectory(),
  );
  for (const domain of featureDomains) {
    for (const shadowParent of ["src/components", "src/hooks", "src/services"]) {
      const shadow = join(shadowParent, domain);
      if (existsSync(shadow)) {
        violations.push(
          `Shadow domain dir: ${shadow}/ duplicates src/features/${domain}/. ` +
            `A feature owns its components/hooks/services together — move the contents into src/features/${domain}/${shadowParent.split("/")[1]}/.`,
        );
      }
    }
  }
}

// 3. Page size ratchet
const pageFiles = readdirSync("src/pages")
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => join("src/pages", f));
const oversized = [];
for (const file of pageFiles) {
  const lineCount = readFileSync(file, "utf8").split("\n").length;
  if (lineCount > PAGE_LINE_CEILING) {
    oversized.push({ file, lineCount });
  }
}
oversized.sort((a, b) => b.lineCount - a.lineCount);
for (const { file, lineCount } of oversized) {
  violations.push(
    `Oversized page: ${file} (${lineCount} lines, ceiling ${PAGE_LINE_CEILING}). ` +
      `Extract panels into a sibling module — see src/components/admin/analytics/ for the pattern.`,
  );
}

// 4. AppProviders adoption
const appTsx = readFileSync("src/App.tsx", "utf8");
if (!/@\/providers\/AppProviders/.test(appTsx)) {
  violations.push(
    `src/App.tsx does not import @/providers/AppProviders. ` +
      `The provider pyramid lives in AppProviders; App.tsx should orchestrate it, not re-roll it inline.`,
  );
}

// Report
const checked = [
  "banned directories",
  "feature-folder coherence",
  `page size ≤ ${PAGE_LINE_CEILING} lines`,
  "AppProviders adoption",
];
console.log(`check:structure — ${checked.length} checks: ${checked.join(", ")}`);

if (violations.length === 0) {
  console.log("✓ all structural checks pass");
  process.exit(0);
}

console.error(`\n✖ ${violations.length} structural violation${violations.length === 1 ? "" : "s"}:\n`);
for (const v of violations) console.error(`  • ${v}`);
process.exit(1);
