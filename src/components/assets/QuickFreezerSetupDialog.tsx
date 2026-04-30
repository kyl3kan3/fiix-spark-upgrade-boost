import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Snowflake, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateAssets } from "@/services/assets/mutations/createAssetMutations";
import { checklistService } from "@/services/checklistService";
import { ChecklistFrequencies } from "@/types/checklists";
import { CHECKLIST_TEMPLATES, getTemplateById } from "@/lib/checklists/templates";

type GroupMode = "new" | "existing";

interface FreezerGroup {
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

const makeGroup = (overrides: Partial<FreezerGroup> = {}): FreezerGroup => {
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
};

/**
 * One-shot setup: bulk-create freezer assets AND attach them to inspection
 * checklists in a single submission. Supports MULTIPLE groups so different
 * freezer sets can get different checklist templates.
 */
const QuickFreezerSetupDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [groups, setGroups] = useState<FreezerGroup[]>([makeGroup()]);

  const { data: existingChecklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => checklistService.getChecklists(),
    enabled: open,
  });

  const computeNames = (g: FreezerGroup): string[] => {
    if (g.useCustomNames) {
      return g.namesText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const n = Math.max(0, Math.min(200, Number(g.count) || 0));
    return Array.from({ length: n }, (_, i) => `${g.prefix.trim()} ${i + 1}`.trim()).filter(Boolean);
  };

  const parseItems = (text: string) =>
    text.split("\n").map((s) => s.trim()).filter(Boolean);

  const updateGroup = (id: string, patch: Partial<FreezerGroup>) => {
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const applyTemplate = (id: string, templateId: string) => {
    const tpl = getTemplateById(templateId);
    updateGroup(id, {
      templateId,
      checklistName: tpl.defaultChecklistName,
      frequency: tpl.defaultFrequency,
      itemsText: tpl.items.join("\n"),
    });
  };

  const addGroup = () => setGroups((gs) => [...gs, makeGroup({ prefix: `Group ${gs.length + 1}` })]);
  const removeGroup = (id: string) =>
    setGroups((gs) => (gs.length === 1 ? gs : gs.filter((g) => g.id !== id)));

  const reset = () => setGroups([makeGroup()]);

  const totalAssets = useMemo(
    () => groups.reduce((sum, g) => sum + computeNames(g).length, 0),
    [groups],
  );

  const mutation = useMutation({
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
        const assetIds = (createdAssets || []).map((a: any) => a.id);

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
          await checklistService.setChecklistAssets(checklistId, assetIds);
        } else {
          const target = existingChecklists.find((c) => c.id === checklistId);
          const merged = Array.from(new Set([...(target?.asset_ids || []), ...assetIds]));
          await checklistService.setChecklistAssets(checklistId, merged);
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
      reset();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error("Setup failed", { description: err.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Snowflake className="h-5 w-5" />
          Quick Freezer Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick freezer setup</DialogTitle>
          <DialogDescription>
            Create freezer units in groups and attach a different inspection checklist template to each group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {groups.map((g, idx) => {
            const names = computeNames(g);
            const items = parseItems(g.itemsText);
            return (
              <div key={g.id} className="rounded-lg border p-4 space-y-4 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Group {idx + 1}</h3>
                  {groups.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(g.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>

                {/* Freezer units */}
                <section className="space-y-3">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Freezer units
                  </h4>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <Label htmlFor={`custom-names-${g.id}`} className="text-sm">
                        Use custom names
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Off: auto-generate "{g.prefix} 1", "{g.prefix} 2"…
                      </p>
                    </div>
                    <Switch
                      id={`custom-names-${g.id}`}
                      checked={g.useCustomNames}
                      onCheckedChange={(v) => updateGroup(g.id, { useCustomNames: v })}
                    />
                  </div>

                  {!g.useCustomNames ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`prefix-${g.id}`}>Name prefix</Label>
                        <Input
                          id={`prefix-${g.id}`}
                          value={g.prefix}
                          onChange={(e) => updateGroup(g.id, { prefix: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`count-${g.id}`}>How many</Label>
                        <Input
                          id={`count-${g.id}`}
                          type="number"
                          min={1}
                          max={200}
                          value={g.count}
                          onChange={(e) => updateGroup(g.id, { count: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor={`names-${g.id}`}>Names (one per line or comma-separated)</Label>
                      <Textarea
                        id={`names-${g.id}`}
                        rows={4}
                        value={g.namesText}
                        onChange={(e) => updateGroup(g.id, { namesText: e.target.value })}
                        placeholder={"Walk-in Freezer A\nReach-in Freezer B"}
                      />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {names.length} unit{names.length === 1 ? "" : "s"} ready
                    {names.length > 0 && (
                      <>
                        :{" "}
                        <span className="text-foreground">
                          {names.slice(0, 3).join(", ")}
                          {names.length > 3 ? `, +${names.length - 3} more` : ""}
                        </span>
                      </>
                    )}
                  </p>
                </section>

                {/* Inspection checklist */}
                <section className="space-y-3">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Inspection checklist
                  </h4>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={g.mode === "new" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateGroup(g.id, { mode: "new" })}
                    >
                      From template
                    </Button>
                    <Button
                      type="button"
                      variant={g.mode === "existing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateGroup(g.id, { mode: "existing" })}
                      disabled={existingChecklists.length === 0}
                    >
                      Use existing
                    </Button>
                  </div>

                  {g.mode === "new" ? (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor={`tpl-${g.id}`}>Template</Label>
                        <Select
                          value={g.templateId}
                          onValueChange={(v) => applyTemplate(g.id, v)}
                        >
                          <SelectTrigger id={`tpl-${g.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CHECKLIST_TEMPLATES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {getTemplateById(g.templateId).description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`cl-name-${g.id}`}>Checklist name</Label>
                          <Input
                            id={`cl-name-${g.id}`}
                            value={g.checklistName}
                            onChange={(e) => updateGroup(g.id, { checklistName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`cl-freq-${g.id}`}>Frequency</Label>
                          <Select
                            value={g.frequency}
                            onValueChange={(v) => updateGroup(g.id, { frequency: v })}
                          >
                            <SelectTrigger id={`cl-freq-${g.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ChecklistFrequencies.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`items-${g.id}`}>Inspection items (one per line)</Label>
                        <Textarea
                          id={`items-${g.id}`}
                          rows={5}
                          value={g.itemsText}
                          onChange={(e) => updateGroup(g.id, { itemsText: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {items.length} item{items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor={`existing-cl-${g.id}`}>Existing checklist</Label>
                      <Select
                        value={g.existingChecklistId}
                        onValueChange={(v) => updateGroup(g.id, { existingChecklistId: v })}
                      >
                        <SelectTrigger id={`existing-cl-${g.id}`}>
                          <SelectValue placeholder="Select a checklist" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingChecklists.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        New units will be added to this checklist's existing assets.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={addGroup} className="w-full">
            <Plus className="h-4 w-4" />
            Add another group
          </Button>
        </div>

        <DialogFooter>
          <p className="mr-auto text-xs text-muted-foreground self-center">
            {totalAssets} unit{totalAssets === 1 ? "" : "s"} across {groups.length} group
            {groups.length === 1 ? "" : "s"}
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || totalAssets === 0}
          >
            {mutation.isPending ? "Setting up…" : "Create & link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickFreezerSetupDialog;