import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChecklistFrequencies, type Checklist } from "@/types/checklists";
import { CHECKLIST_TEMPLATES, getTemplateById } from "@/lib/checklists/templates";
import { parseItems, type FreezerGroup } from "./types";

interface Props {
  group: FreezerGroup;
  existingChecklists: Checklist[];
  onUpdate: (patch: Partial<FreezerGroup>) => void;
}

export const ChecklistSection: React.FC<Props> = ({ group: g, existingChecklists, onUpdate }) => {
  const items = parseItems(g.itemsText);

  const applyTemplate = (templateId: string) => {
    const tpl = getTemplateById(templateId);
    onUpdate({
      templateId,
      checklistName: tpl.defaultChecklistName,
      frequency: tpl.defaultFrequency,
      itemsText: tpl.items.join("\n"),
    });
  };

  return (
    <section className="space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Inspection checklist
      </h4>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={g.mode === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdate({ mode: "new" })}
        >
          From template
        </Button>
        <Button
          type="button"
          variant={g.mode === "existing" ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdate({ mode: "existing" })}
          disabled={existingChecklists.length === 0}
        >
          Use existing
        </Button>
      </div>

      {g.mode === "new" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`tpl-${g.id}`}>Template</Label>
            <Select value={g.templateId} onValueChange={applyTemplate}>
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
            <p className="text-xs text-muted-foreground">{getTemplateById(g.templateId).description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`cl-name-${g.id}`}>Checklist name</Label>
              <Input
                id={`cl-name-${g.id}`}
                value={g.checklistName}
                onChange={(e) => onUpdate({ checklistName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`cl-freq-${g.id}`}>Frequency</Label>
              <Select value={g.frequency} onValueChange={(v) => onUpdate({ frequency: v })}>
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
              onChange={(e) => onUpdate({ itemsText: e.target.value })}
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
            onValueChange={(v) => onUpdate({ existingChecklistId: v })}
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
  );
};
