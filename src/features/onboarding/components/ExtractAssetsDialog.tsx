import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { extractAssetsFromDocument } from "@/services/assetExtractionService";
import { importAssets } from "@/services/csvImportService";
import type { AssetImportRow } from "@/lib/csvImport";
import type { OnboardingDocument } from "@/services/documentDumpService";

interface Props {
  doc: OnboardingDocument;
}

const ExtractAssetsDialog: React.FC<Props> = ({ doc }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [proposals, setProposals] = useState<AssetImportRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const reset = () => {
    setProposals([]);
    setSelected(new Set());
  };

  const extract = useMutation({
    mutationFn: () => extractAssetsFromDocument(doc),
    onSuccess: (rows) => {
      setProposals(rows);
      setSelected(new Set(rows.map((_, i) => i)));
      queryClient.invalidateQueries({ queryKey: ["onboarding-documents"] });
      if (rows.length === 0) toast.info("No assets found in this document");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Extraction failed"),
  });

  const create = useMutation({
    mutationFn: () => importAssets(proposals.filter((_, i) => selected.has(i))),
    onSuccess: (count) => {
      toast.success(`Created ${count} ${count === 1 ? "asset" : "assets"}`);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error("Couldn't create assets"),
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) extract.mutate();
    else reset();
  };

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Extract assets">
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extract assets from {doc.file_name}</DialogTitle>
          <DialogDescription>
            The assistant read this document and proposed the assets below. Pick which to add.
          </DialogDescription>
        </DialogHeader>

        {extract.isPending ? (
          <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the document…
          </div>
        ) : proposals.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No assets were found in this document.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-1">
            {proposals.map((a, i) => (
              <label
                key={i}
                className="flex items-start gap-3 rounded-md border p-2 cursor-pointer hover:bg-muted/40"
              >
                <Checkbox checked={selected.has(i)} onCheckedChange={() => toggle(i)} className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[a.location, a.model, a.serial_number, a.status].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => create.mutate()}
            disabled={selected.size === 0 || create.isPending || extract.isPending}
          >
            {create.isPending ? "Adding…" : `Add ${selected.size} ${selected.size === 1 ? "asset" : "assets"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractAssetsDialog;
