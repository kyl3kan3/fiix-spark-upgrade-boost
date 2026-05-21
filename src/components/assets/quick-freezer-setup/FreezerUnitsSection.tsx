import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { computeNames, type FreezerGroup } from "./types";

interface FreezerUnitsSectionProps {
  group: FreezerGroup;
  onUpdate: (patch: Partial<FreezerGroup>) => void;
}

export const FreezerUnitsSection: React.FC<FreezerUnitsSectionProps> = ({ group: g, onUpdate }) => {
  const names = computeNames(g);
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Freezer units
      </h4>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor={`custom-names-${g.id}`} className="text-sm">Use custom names</Label>
          <p className="text-xs text-muted-foreground">
            Off: auto-generate "{g.prefix} 1", "{g.prefix} 2"…
          </p>
        </div>
        <Switch
          id={`custom-names-${g.id}`}
          checked={g.useCustomNames}
          onCheckedChange={(v) => onUpdate({ useCustomNames: v })}
        />
      </div>

      {!g.useCustomNames ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`prefix-${g.id}`}>Name prefix</Label>
            <Input
              id={`prefix-${g.id}`}
              value={g.prefix}
              onChange={(e) => onUpdate({ prefix: e.target.value })}
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
              onChange={(e) => onUpdate({ count: Number(e.target.value) })}
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
            onChange={(e) => onUpdate({ namesText: e.target.value })}
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
  );
};
