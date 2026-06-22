import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { parseEnergyCsv, type ParsedEnergyRow } from "@/lib/energyAnalytics";

interface Props {
  isImporting: boolean;
  onImport: (rows: ParsedEnergyRow[], currency: string) => Promise<number>;
}

const ImportEnergyCsvDialog: React.FC<Props> = ({ isImporting, onImport }) => {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [rows, setRows] = useState<ParsedEnergyRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setErrors([]);
    setFileName("");
    setCurrency("USD");
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const result = parseEnergyCsv(text);
      setRows(result.rows);
      setErrors(result.errors);
    } catch (e) {
      console.error("Failed to read CSV:", e);
      toast.error("Couldn't read that file");
    }
  };

  const submit = async () => {
    if (rows.length === 0) return;
    const n = await onImport(rows, currency.trim().toUpperCase() || "USD");
    toast.success(`Imported ${n} ${n === 1 ? "reading" : "readings"}`);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import energy readings from CSV</DialogTitle>
          <DialogDescription>
            Columns: <code>date</code>, <code>kwh</code>, optional <code>cost</code> and <code>meter</code>.
            Rows with a bad date or kWh are skipped.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV file</Label>
            <Input
              id="csv-file"
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="csv-currency">Currency for costs</Label>
            <Input
              id="csv-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
              className="w-28"
            />
          </div>

          {fileName && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">{fileName}</p>
              <p className="text-muted-foreground">
                {rows.length} valid {rows.length === 1 ? "row" : "rows"}
                {errors.length > 0 ? ` · ${errors.length} skipped` : ""}
              </p>
              {errors.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-destructive space-y-0.5">
                  {errors.slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {errors.length > 4 && <li>…and {errors.length - 4} more</li>}
                </ul>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={rows.length === 0 || isImporting}>
            {isImporting ? "Importing…" : `Import ${rows.length || ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportEnergyCsvDialog;
