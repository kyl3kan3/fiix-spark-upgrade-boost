import { getTemplateById } from "@/lib/checklists/templates";

export type GroupMode = "new" | "existing";

export interface FreezerGroup {
  id: string;
  // Asset section
  prefix: string;
  count: number;
  namesText: string;
  useCustomNames: boolean;
  // Checklist section
  mode: GroupMode;
  templateId: string;
  checklistName: string;
  frequency: string;
  itemsText: string;
  existingChecklistId: string;
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function makeGroup(overrides: Partial<FreezerGroup> = {}): FreezerGroup {
  const tpl = getTemplateById(overrides.templateId ?? "freezer-coil-daily");
  return {
    id: newId(),
    prefix: "Freezer",
    count: 5,
    namesText: "",
    useCustomNames: false,
    mode: "new",
    templateId: tpl.id,
    checklistName: tpl.defaultChecklistName,
    frequency: tpl.defaultFrequency,
    itemsText: tpl.items.join("\n"),
    existingChecklistId: "",
    ...overrides,
  };
}

export function computeNames(g: FreezerGroup): string[] {
  if (g.useCustomNames) {
    return g.namesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const n = Math.max(0, Math.min(200, Number(g.count) || 0));
  return Array.from({ length: n }, (_, i) => `${g.prefix.trim()} ${i + 1}`.trim()).filter(Boolean);
}

export function parseItems(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
