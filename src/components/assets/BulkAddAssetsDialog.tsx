import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layers, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateAssets, bulkCreateAssetsFromRows } from "@/services/assets/mutations/createAssetMutations";
import Papa from "papaparse";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ParsedRow = {
  name: string;
  description?: string | null;
  model?: string | null;
  serial_number?: string | null;
  location?: string | null;
  status?: string | null;
};

/**
 * Quick way to add multiple assets at once (e.g. "Freezer 1", "Freezer 2", ...).
 * Accepts one name per line or comma-separated.
 */
const BulkAddAssetsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [csvError, setCsvError] = useState<string>("");
  const [tab, setTab] = useState<"text" | "csv">("text");
  const queryClient = useQueryClient();

  const parseNames = (raw: string) =>
    raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const mutation = useMutation({
    mutationFn: async () => {
      if (tab === "csv") {
        if (csvRows.length === 0) throw new Error("Upload a CSV with at least one row");
        const { error } = await bulkCreateAssetsFromRows(csvRows);
        if (error) throw error;
        return csvRows.length;
      }
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
      setCsvRows([]);
      setCsvFileName("");
      setCsvError("");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error("Bulk add failed", { description: err.message });
    },
  });

  const previewCount = parseNames(text).length;

  const handleFile = (file: File) => {
    setCsvError("");
    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => {
        const rows: ParsedRow[] = (results.data as any[])
          .map((r) => ({
            name: (r.name || r.label || r.asset_name || "").toString().trim(),
            description: (r.description || r.notes || "").toString().trim() || null,
            model: (r.model || "").toString().trim() || null,
            serial_number: (r.serial_number || r.serial || "").toString().trim() || null,
            location: (r.location || "").toString().trim() || null,
            status: ((r.status || "active").toString().trim().toLowerCase()) || "active",
          }))
          .filter((r) => r.name);
        if (rows.length === 0) {
          setCsvError("No valid rows found. CSV needs a 'name' (or 'label') column.");
        }
        setCsvRows(rows);
      },
      error: (err) => {
        setCsvError(err.message);
        setCsvRows([]);
      },
    });
  };

  const downloadTemplate = () => {
    const csv = "name,description,model,serial_number,location,status\nFreezer 1,Walk-in unit,WF-200,SN-001,Kitchen,active\nFreezer 2,Reach-in unit,RF-100,SN-002,Prep area,active\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipment-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Layers className="h-5 w-5" />
          Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk add equipment</DialogTitle>
          <DialogDescription>
            Paste names or upload a CSV. Great for adding all freezer units at once.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "text" | "csv")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Paste names</TabsTrigger>
            <TabsTrigger value="csv">Upload CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-2 mt-4">
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
          </TabsContent>

          <TabsContent value="csv" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="csv-file">CSV file</Label>
              <Button type="button" variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4" />
                Template
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Columns: <code>name</code> (required), <code>description</code>, <code>model</code>, <code>serial_number</code>, <code>location</code>, <code>status</code>.
            </p>
            {csvError && <p className="text-sm text-destructive">{csvError}</p>}
            {csvRows.length > 0 && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-1">
                <p className="text-sm font-medium">
                  {csvFileName} — {csvRows.length} row{csvRows.length === 1 ? "" : "s"} ready
                </p>
                <ul className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {csvRows.slice(0, 5).map((r, i) => (
                    <li key={i}>
                      • {r.name}
                      {r.model ? ` — ${r.model}` : ""}
                      {r.location ? ` @ ${r.location}` : ""}
                    </li>
                  ))}
                  {csvRows.length > 5 && <li>…and {csvRows.length - 5} more</li>}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              (tab === "text" ? previewCount === 0 : csvRows.length === 0)
            }
          >
            {mutation.isPending
              ? "Adding…"
              : `Add ${tab === "text" ? previewCount || "" : csvRows.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddAssetsDialog;