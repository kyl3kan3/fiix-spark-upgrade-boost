import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Snowflake, Plus, Trash2 } from "lucide-react";
import { checklistService } from "@/services/checklistService";
import { ChecklistSection } from "./quick-freezer-setup/ChecklistSection";
import { FreezerUnitsSection } from "./quick-freezer-setup/FreezerUnitsSection";
import { useFreezerSetupMutation } from "./quick-freezer-setup/useFreezerSetupMutation";
import { computeNames, makeGroup, type FreezerGroup } from "./quick-freezer-setup/types";

/**
 * One-shot setup: bulk-create freezer assets AND attach them to inspection
 * checklists in a single submission. Supports MULTIPLE groups so different
 * freezer sets can get different checklist templates.
 */
const QuickFreezerSetupDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<FreezerGroup[]>([makeGroup()]);

  const { data: existingChecklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => checklistService.getChecklists(),
    enabled: open,
  });

  const updateGroup = (id: string, patch: Partial<FreezerGroup>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const addGroup = () =>
    setGroups((gs) => [...gs, makeGroup({ prefix: `Group ${gs.length + 1}` })]);

  const removeGroup = (id: string) =>
    setGroups((gs) => (gs.length === 1 ? gs : gs.filter((g) => g.id !== id)));

  const reset = () => setGroups([makeGroup()]);

  const totalAssets = useMemo(
    () => groups.reduce((sum, g) => sum + computeNames(g).length, 0),
    [groups],
  );

  const mutation = useFreezerSetupMutation({
    groups,
    existingChecklists,
    onDone: () => {
      reset();
      setOpen(false);
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
          {groups.map((g, idx) => (
            <div key={g.id} className="rounded-lg border p-4 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Group {idx + 1}</h3>
                {groups.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeGroup(g.id)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              <FreezerUnitsSection group={g} onUpdate={(patch) => updateGroup(g.id, patch)} />

              <ChecklistSection
                group={g}
                existingChecklists={existingChecklists}
                onUpdate={(patch) => updateGroup(g.id, patch)}
              />
            </div>
          ))}

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
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || totalAssets === 0}>
            {mutation.isPending ? "Setting up…" : "Create & link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickFreezerSetupDialog;
