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
import { Snowflake } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateAssets } from "@/services/assets/mutations/createAssetMutations";
import { checklistService } from "@/services/checklistService";
import { ChecklistFrequencies } from "@/types/checklists";

/**
 * One-shot setup: bulk-create freezer assets AND attach them to a checklist
 * (new or existing) in a single submission. Optimized for the common
 * "stand up daily coil checks for N freezers" workflow.
 */
const DEFAULT_ITEMS = [
  "Ice build-up OK",
  "Belt condition OK",
  "No leaking valves",
  "Coil clean",
  "Temperature in range",
];

const QuickFreezerSetupDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Asset inputs
  const [prefix, setPrefix] = useState("Freezer");
  const [count, setCount] = useState(5);
  const [namesText, setNamesText] = useState("");
  const [useCustomNames, setUseCustomNames] = useState(false);

  // Checklist inputs
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [checklistName, setChecklistName] = useState("Freezer coil daily check");
  const [frequency, setFrequency] = useState("daily");
  const [itemsText, setItemsText] = useState(DEFAULT_ITEMS.join("\n"));
  const [existingChecklistId, setExistingChecklistId] = useState<string>("");

  const { data: existingChecklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => checklistService.getChecklists(),
    enabled: open,
  });

  const computedNames = useMemo(() => {
    if (useCustomNames) {
      return namesText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const n = Math.max(0, Math.min(200, Number(count) || 0));
    return Array.from({ length: n }, (_, i) => `${prefix.trim()} ${i + 1}`.trim()).filter(Boolean);
  }, [useCustomNames, namesText, prefix, count]);

  const parsedItems = useMemo(
    () =>
      itemsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [itemsText],
  );

  const reset = () => {
    setPrefix("Freezer");
    setCount(5);
    setNamesText("");
    setUseCustomNames(false);
    setMode("new");
    setChecklistName("Freezer coil daily check");
    setFrequency("daily");
    setItemsText(DEFAULT_ITEMS.join("\n"));
    setExistingChecklistId("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (computedNames.length === 0) throw new Error("Add at least one freezer name");
      if (mode === "new" && !checklistName.trim()) throw new Error("Checklist name required");
      if (mode === "new" && parsedItems.length === 0) throw new Error("Add at least one checklist item");
      if (mode === "existing" && !existingChecklistId) throw new Error("Pick an existing checklist");

      // 1. Bulk create assets
      const { data: createdAssets, error: assetErr } = await bulkCreateAssets(computedNames, {
        description: "Freezer unit",
      });
      if (assetErr) throw assetErr;
      const assetIds = (createdAssets || []).map((a: any) => a.id);

      // 2. Resolve target checklist
      let checklistId = existingChecklistId;
      if (mode === "new") {
        const created = await checklistService.createChecklist({
          name: checklistName.trim(),
          description: "Daily freezer coil inspection",
          type: "equipment",
          frequency,
          is_active: true,
        });
        checklistId = created.id;

        // Add items
        await Promise.all(
          parsedItems.map((title, i) =>
            checklistService.createChecklistItem({
              checklist_id: checklistId,
              title,
              item_type: "checkbox",
              is_required: true,
              sort_order: i,
            }),
          ),
        );

        await checklistService.ensureSchedule(checklistId, frequency);
      }

      // 3. Link assets to checklist (merge with any existing links for "existing" mode)
      if (mode === "existing") {
        const target = existingChecklists.find((c) => c.id === checklistId);
        const merged = Array.from(new Set([...(target?.asset_ids || []), ...assetIds]));
        await checklistService.setChecklistAssets(checklistId, merged);
      } else {
        await checklistService.setChecklistAssets(checklistId, assetIds);
      }

      return { assetCount: assetIds.length };
    },
    onSuccess: ({ assetCount }) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success(`Set up ${assetCount} freezer${assetCount === 1 ? "" : "s"} with checklist`);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick freezer setup</DialogTitle>
          <DialogDescription>
            Create multiple freezer units and attach them to an inspection checklist in one step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assets section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">1. Freezer units</h3>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="custom-names" className="text-sm">Use custom names</Label>
                <p className="text-xs text-muted-foreground">
                  Off: auto-generate "{prefix} 1", "{prefix} 2"…
                </p>
              </div>
              <Switch
                id="custom-names"
                checked={useCustomNames}
                onCheckedChange={setUseCustomNames}
              />
            </div>

            {!useCustomNames ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prefix">Name prefix</Label>
                  <Input
                    id="prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="count">How many</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={200}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="names">Names (one per line or comma-separated)</Label>
                <Textarea
                  id="names"
                  rows={5}
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder={"Walk-in Freezer A\nReach-in Freezer B"}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {computedNames.length} unit{computedNames.length === 1 ? "" : "s"} ready
              {computedNames.length > 0 && (
                <>: <span className="text-foreground">{computedNames.slice(0, 3).join(", ")}{computedNames.length > 3 ? `, +${computedNames.length - 3} more` : ""}</span></>
              )}
            </p>
          </section>

          {/* Checklist section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">2. Inspection checklist</h3>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("new")}
              >
                New checklist
              </Button>
              <Button
                type="button"
                variant={mode === "existing" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("existing")}
                disabled={existingChecklists.length === 0}
              >
                Use existing
              </Button>
            </div>

            {mode === "new" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="cl-name">Checklist name</Label>
                    <Input
                      id="cl-name"
                      value={checklistName}
                      onChange={(e) => setChecklistName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="cl-freq">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="cl-freq">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ChecklistFrequencies.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="items">Inspection items (one per line)</Label>
                  <Textarea
                    id="items"
                    rows={5}
                    value={itemsText}
                    onChange={(e) => setItemsText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {parsedItems.length} item{parsedItems.length === 1 ? "" : "s"}
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="existing-cl">Existing checklist</Label>
                <Select value={existingChecklistId} onValueChange={setExistingChecklistId}>
                  <SelectTrigger id="existing-cl">
                    <SelectValue placeholder="Select a checklist" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingChecklists.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || computedNames.length === 0}
          >
            {mutation.isPending ? "Setting up…" : "Create & link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickFreezerSetupDialog;