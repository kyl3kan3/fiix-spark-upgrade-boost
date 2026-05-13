import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkCreateAssets } from "@/services/assets/mutations/createAssetMutations";
import { checklistService } from "@/services/checklistService";
import { getTemplateById } from "@/lib/checklists/templates";
import type { Checklist } from "@/types/checklists";
import { computeNames, parseItems, type FreezerGroup } from "./types";

interface Args {
  groups: FreezerGroup[];
  existingChecklists: Checklist[];
  onDone: () => void;
}

export function useFreezerSetupMutation({ groups, existingChecklists, onDone }: Args) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Validate every group up front
      for (const [idx, g] of groups.entries()) {
        const names = computeNames(g);
        if (names.length === 0) throw new Error(`Group ${idx + 1}: add at least one freezer`);
        if (g.mode === "new") {
          if (!g.checklistName.trim()) throw new Error(`Group ${idx + 1}: checklist name required`);
          if (parseItems(g.itemsText).length === 0)
            throw new Error(`Group ${idx + 1}: add at least one checklist item`);
        } else if (!g.existingChecklistId) {
          throw new Error(`Group ${idx + 1}: pick an existing checklist`);
        }
      }

      let totalCreated = 0;
      for (const g of groups) {
        const names = computeNames(g);
        const { data: createdAssets, error: assetErr } = await bulkCreateAssets(names, {
          description: "Freezer unit",
        });
        if (assetErr) throw assetErr;
        const assetIds = (createdAssets || []).map((a: { id: string }) => a.id);

        let checklistId = g.existingChecklistId;
        if (g.mode === "new") {
          const created = await checklistService.createChecklist({
            name: g.checklistName.trim(),
            description: getTemplateById(g.templateId).description,
            type: "equipment",
            frequency: g.frequency,
            is_active: true,
          });
          checklistId = created.id;

          const items = parseItems(g.itemsText);
          await Promise.all(
            items.map((title, i) =>
              checklistService.createChecklistItem({
                checklist_id: checklistId,
                title,
                item_type: "checkbox",
                is_required: true,
                sort_order: i,
              }),
            ),
          );
          await checklistService.ensureSchedule(checklistId, g.frequency);
          // Auto-stagger new freezer prompts 15 min apart so they don't all fire at once.
          await checklistService.setChecklistAssets(checklistId, assetIds, {
            autoStaggerMinutes: 15,
          });
        } else {
          const target = existingChecklists.find((c) => c.id === checklistId);
          const merged = Array.from(new Set([...(target?.asset_ids || []), ...assetIds]));
          // Preserve existing assets' positions; only stagger the appended new ones.
          const existingOffsets =
            (target as Checklist & { asset_offsets?: Record<string, number> })?.asset_offsets || {};
          const offsets: Record<string, number> = { ...existingOffsets };
          const baseCount = (target?.asset_ids || []).length;
          assetIds.forEach((id, i) => {
            offsets[id] = (baseCount + i) * 15;
          });
          await checklistService.setChecklistAssets(checklistId, merged, { offsets });
        }

        totalCreated += assetIds.length;
      }

      return { assetCount: totalCreated, groupCount: groups.length };
    },
    onSuccess: ({ assetCount, groupCount }) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success(
        `Set up ${assetCount} freezer${assetCount === 1 ? "" : "s"} across ${groupCount} group${
          groupCount === 1 ? "" : "s"
        }`,
      );
      onDone();
    },
    onError: (err: unknown) => {
      toast.error("Setup failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });
}
