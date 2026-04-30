import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateAssets } from "@/services/assets/mutations/createAssetMutations";

/**
 * Quick way to add multiple assets at once (e.g. "Freezer 1", "Freezer 2", ...).
 * Accepts one name per line or comma-separated.
 */
const BulkAddAssetsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  const parseNames = (raw: string) =>
    raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const mutation = useMutation({
    mutationFn: async () => {
      const names = parseNames(text);
      if (names.length === 0) throw new Error("Enter at least one name");
      const { error } = await bulkCreateAssets(names);
      if (error) throw error;
      return names.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success(`Added ${count} ${count === 1 ? "asset" : "assets"}`);
      setText("");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error("Bulk add failed", { description: err.message });
    },
  });

  const previewCount = parseNames(text).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Layers className="h-5 w-5" />
          Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk add equipment</DialogTitle>
          <DialogDescription>
            One name per line, or separate with commas. Great for adding all freezer units at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="bulk-names">Names</Label>
          <Textarea
            id="bulk-names"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Freezer 1\nFreezer 2\nFreezer 3"}
            rows={8}
          />
          <p className="text-sm text-muted-foreground">
            {previewCount} {previewCount === 1 ? "item" : "items"} ready to add
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || previewCount === 0}
          >
            {mutation.isPending ? "Adding…" : `Add ${previewCount || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddAssetsDialog;