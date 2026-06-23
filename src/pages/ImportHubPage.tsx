import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import PageContainer from "@/components/shell/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseCsvRecords,
  validateAssetRows,
  validateWorkOrderRows,
  IMPORT_TEMPLATES,
  type ImportKind,
} from "@/lib/csvImport";
import { importAssets, importWorkOrders } from "@/services/csvImportService";

const KIND_LABELS: Record<ImportKind, string> = {
  assets: "Equipment / assets",
  work_orders: "Work orders",
};

interface Parsed {
  fileName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
  errors: string[];
}

const ImportHubPage = () => {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<ImportKind>("assets");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onKindChange = (k: string) => {
    setKind(k as ImportKind);
    reset();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const { records, error } = parseCsvRecords(text);
      if (error) {
        setParsed({ fileName: file.name, rows: [], errors: [error] });
        return;
      }
      const result =
        kind === "assets" ? validateAssetRows(records) : validateWorkOrderRows(records);
      setParsed({ fileName: file.name, rows: result.rows, errors: result.errors });
    } catch (e) {
      console.error("Failed to read CSV:", e);
      toast.error("Couldn't read that file");
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!parsed) return 0;
      return kind === "assets" ? importAssets(parsed.rows) : importWorkOrders(parsed.rows);
    },
    onSuccess: (count) => {
      toast.success(`Imported ${count} ${count === 1 ? "record" : "records"}`);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      reset();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Import failed"),
  });

  return (
    <DashboardLayout>
      <PageHeader
        code="IMP · 001"
        title="Import Data"
        description="Bring your existing records into MaintenEase from a CSV — no manual re-entry. Pick a data type, upload, review, and import."
      />
      <PageContainer>
        <div className="space-y-6 max-w-3xl">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">What are you importing?</Label>
                  <Select value={kind} onValueChange={onKindChange}>
                    <SelectTrigger aria-label="Import type" className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assets">{KIND_LABELS.assets}</SelectItem>
                      <SelectItem value="work_orders">{KIND_LABELS.work_orders}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Button onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose CSV
                </Button>
              </div>

              <div className="rounded-md bg-muted/40 p-3 text-xs">
                <p className="font-medium mb-1">Expected columns</p>
                <code className="break-all">{IMPORT_TEMPLATES[kind]}</code>
                <p className="text-muted-foreground mt-1">
                  First row must be the header. Extra columns are ignored; only the first column is required.
                </p>
              </div>
            </CardContent>
          </Card>

          {parsed && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{parsed.fileName}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="inline-flex items-center text-success">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {parsed.rows.length} ready to import
                  </span>
                  {parsed.errors.length > 0 && (
                    <span className="inline-flex items-center text-warning">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {parsed.errors.length} skipped
                    </span>
                  )}
                </div>

                {parsed.errors.length > 0 && (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                    {parsed.errors.slice(0, 8).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parsed.errors.length > 8 && <li>…and {parsed.errors.length - 8} more</li>}
                  </ul>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => importMutation.mutate()}
                    disabled={parsed.rows.length === 0 || importMutation.isPending}
                  >
                    {importMutation.isPending
                      ? "Importing…"
                      : `Import ${parsed.rows.length} ${KIND_LABELS[kind].toLowerCase()}`}
                  </Button>
                  <Button variant="outline" onClick={reset} disabled={importMutation.isPending}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default ImportHubPage;
