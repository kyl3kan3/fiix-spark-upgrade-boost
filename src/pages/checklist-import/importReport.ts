import type { DraftItem } from "./types";

interface ReportArgs {
  items: DraftItem[];
  name: string;
  sourceFiles: string[];
  emptyIndices: Set<number>;
  duplicateIndices: Set<number>;
  dupOf: Map<number, number>;
}

/** Builds and downloads a CSV import report summarising parse results and per-row status. */
export function downloadImportReport({
  items,
  name,
  sourceFiles,
  emptyIndices,
  duplicateIndices,
  dupOf,
}: ReportArgs) {
  const valid = items.filter((it) => it.title.trim());
  const dupExtras = duplicateIndices.size - new Set(Array.from(dupOf.values())).size;
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;

  const lines: string[] = [
    "Checklist Import Report",
    `Generated,${new Date().toISOString()}`,
    `Checklist name,"${name}"`,
  ];
  if (sourceFiles.length) lines.push(`Source files,"${sourceFiles.join("; ")}"`);
  lines.push(
    "",
    "Summary",
    `Total parsed,${items.length}`,
    `Empty titles,${emptyIndices.size}`,
    `Duplicates,${dupExtras}`,
    `Items to import,${valid.length - dupExtras}`,
    "",
    "Row,Title,Description,Required,Source,Status",
  );
  items.forEach((it, i) => {
    const status = emptyIndices.has(i)
      ? "EMPTY"
      : dupOf.has(i)
        ? `DUPLICATE of row ${dupOf.get(i)! + 1}`
        : "OK";
    lines.push(
      [i + 1, esc(it.title), esc(it.description ?? ""), it.is_required ? "yes" : "no", esc(it.sourceFile ?? ""), status].join(","),
    );
  });

  const blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(name || "checklist").replace(/[^a-z0-9-_]+/gi, "_")}-import-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
