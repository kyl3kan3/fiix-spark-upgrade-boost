#!/usr/bin/env node
/**
 * Responsive-layout ratchet (backlog item 3 — "no responsive primitives").
 *
 * Flags *bare* `grid-cols-2` — a two-column grid with no `grid-cols-1` base and
 * no `sm:`/`md:`/`lg:`/`xl:` responsive sibling, i.e. a layout locked to two
 * columns even on the narrowest phone. New views should use
 * `<ResponsiveGrid cols={{ base, sm, md }}>` (src/components/shell/ResponsiveGrid.tsx)
 * instead of re-deriving the breakpoint ladder inline.
 *
 * This is a ratchet, not an absolute gate: a handful of existing 2-up layouts
 * are genuinely fine on mobile (toggle pairs, compact metric tiles). The build
 * fails only if the count *rises above* BASELINE — preventing the copy-pasted
 * pattern from spreading while leaving the acceptable existing cases alone.
 * When you migrate one, lower BASELINE to lock in the win.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/components", "src/pages"];
const BASELINE = 7;

const CLASS_ATTR = /className=("[^"]*"|\{`[^`]*`\})/g;
const hasBareGrid = (cls) =>
  /\bgrid-cols-2\b/.test(cls) &&
  !/(sm|md|lg|xl):grid-cols-/.test(cls) &&
  !/\bgrid-cols-1\b/.test(cls);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(tsx|ts)$/.test(full)) yield full;
  }
}

const offenders = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(CLASS_ATTR)) {
        if (hasBareGrid(m[0])) offenders.push(`${file}:${i + 1}`);
      }
    });
  }
}

const count = offenders.length;
console.log(`check:responsive — bare grid-cols-2 occurrences: ${count} (baseline ${BASELINE})`);
for (const o of offenders) console.log(`  ${o}`);

if (count > BASELINE) {
  console.error(
    `\n✖ Bare grid-cols-2 count rose to ${count} (baseline ${BASELINE}).\n` +
      `  Use <ResponsiveGrid> from src/components/shell/ResponsiveGrid.tsx for new grids.`,
  );
  process.exit(1);
}
console.log("✓ within baseline");
