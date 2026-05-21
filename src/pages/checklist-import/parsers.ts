import * as XLSX from "xlsx";
import mammoth from "mammoth";
import type { DraftItem } from "./types";

const TRUTHY = /^(true|yes|y|1|x|required)$/i;

/**
 * Parses an Excel/CSV file by auto-guessing the title/description/required
 * columns from the header row. Used for batch / multi-file imports.
 */
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
  return aoa.slice(1).map((row) => {
    const r = row as unknown[];
    const title = String(r[tIdx] ?? "").trim();
    if (!title) return null;
    const desc = dIdx >= 0 ? String(r[dIdx] ?? "").trim() : "";
    const req = rIdx >= 0 ? TRUTHY.test(String(r[rIdx]).trim()) : false;
    return { title, description: desc || undefined, is_required: req, sourceFile: file.name } as DraftItem;
  }).filter(Boolean) as DraftItem[];
}

/**
 * Parses a Word (.docx) file: each non-empty line becomes an item;
 * leading bullets / numbering are stripped.
 */
export async function parseWord(file: File): Promise<DraftItem[]> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-*•\d.)(]+/, "").trim())
    .filter((l) => l.length > 0)
    .map<DraftItem>((title) => ({ title, is_required: false, sourceFile: file.name }));
}
