export type DraftItem = {
  title: string;
  description?: string;
  is_required: boolean;
  sourceFile?: string;
};

export type Step = "upload" | "configure" | "preview";

/** Sentinel for "no column mapped" in the Excel column selectors. */
export const NONE = "__none__";

/** Normalizes a title for duplicate detection: lowercase, strip punctuation, collapse whitespace. */
export const normalizeTitle = (s: string) =>
  s.toLowerCase().replace(/[\p{P}\p{S}]/gu, "").replace(/\s+/g, " ").trim();
