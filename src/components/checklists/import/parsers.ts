import * as XLSX from "xlsx";
import mammoth from "mammoth";

export type DraftItem = {
  title: string;
  description?: string;
  is_required: boolean;
  sourceFile?: string;
};

export type Step = "upload" | "configure" | "preview";

export const NONE = "__none__";

export const normalizeTitle = (s: string) =>
  s.toLowerCase().replace(/[\p{P}\p{S}]/gu, "").replace(/\s+/g, " ").trim();

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Title", "Description", "Required"],
    ["Check oil level", "Inspect dipstick reading", "yes"],
    ["Inspect belts", "Look for cracks or fraying", "no"],
    ["Verify safety guards in place", "", "yes"],
  ]);
  ws["!cols"] = [{ wch: 32 }, { wch: 40 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Checklist");
  XLSX.writeFile(wb, "checklist-template.xlsx");
}

export function downloadWordTemplate() {
  const lines = [
    "Checklist Template",
    "",
    "Each non-empty line below becomes one checklist item.",
    "Numbering and bullets (1., -, *, •) are stripped automatically.",
    "",
    "1. Check oil level",
    "2. Inspect belts",
    "3. Verify safety guards in place",
    "- Test emergency stop button",
    "- Record temperature readings",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "checklist-template.doc";
  a.click();
  URL.revokeObjectURL(url);
}

export async function parseExcelAuto(file: File): Promise<DraftItem[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sn = wb.SheetNames[0];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sn], { header: 1, defval: "" });
  if (aoa.length === 0) return [];
  const headers = (aoa[0] as unknown[]).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
  const guess = (re: RegExp) => headers.findIndex((h) => re.test(h));
  const tIdx = (() => {
    const i = guess(/title|task|item|name/i);
    return i >= 0 ? i : 0;
  })();
  const dIdx = guess(/desc|note/i);
  const rIdx = guess(/required|must|mandatory/i);
  return aoa.slice(1)
    .map((r) => {
      const title = String((r as unknown[])[tIdx] ?? "").trim();
      if (!title) return null;
      const desc = dIdx >= 0 ? String((r as unknown[])[dIdx] ?? "").trim() : "";
      const req = rIdx >= 0 ? /^(true|yes|y|1|x|required)$/i.test(String((r as unknown[])[rIdx]).trim()) : false;
      return { title, description: desc || undefined, is_required: req, sourceFile: file.name } as DraftItem;
    })
    .filter(Boolean) as DraftItem[];
}

export async function parseWord(file: File): Promise<DraftItem[]> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-\*•\d\.\)\(]+/, "").trim())
    .filter((l) => l.length > 0)
    .map<DraftItem>((title) => ({ title, is_required: false, sourceFile: file.name }));
}
