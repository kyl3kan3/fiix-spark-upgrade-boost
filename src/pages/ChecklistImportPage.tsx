import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import { checklistService } from "@/services/checklistService";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, FileText, Download, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NONE,
  normalizeTitle,
  downloadExcelTemplate,
  downloadWordTemplate,
  parseExcelAuto,
  parseWord,
  type DraftItem,
  type Step,
} from "@/components/checklists/import/parsers";
import { PreviewItemRow } from "@/components/checklists/import/PreviewItemRow";

const ChecklistImportPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [frequency, setFrequency] = useState("one-time");

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetName, setSheetName] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [titleCol, setTitleCol] = useState<string>("");
  const [descCol, setDescCol] = useState<string>(NONE);
  const [reqCol, setReqCol] = useState<string>(NONE);

  const [items, setItems] = useState<DraftItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importStats, setImportStats] = useState<{ files: string[]; totalParsed: number } | null>(null);

  const isExcel = useMemo(() => /\.(xlsx|xls|csv)$/i.test(fileName), [fileName]);
  const isWord = useMemo(() => /\.docx$/i.test(fileName), [fileName]);

  const reset = () => {
    setStep("upload");
    setFileName("");
    setWorkbook(null);
    setSheetName("");
    setColumns([]);
    setRawRows([]);
    setTitleCol("");
    setDescCol(NONE);
    setReqCol(NONE);
    setItems([]);
    setSelected(new Set());
    setImportStats(null);
  };

  const loadSheet = (wb: XLSX.WorkBook, sn: string) => {
    const sheet = wb.Sheets[sn];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    if (aoa.length === 0) {
      setColumns([]);
      setRawRows([]);
      return;
    }
    const headerRow = (aoa[0] as unknown[]).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
    const rows = aoa.slice(1).map((r) => {
      const o: Record<string, unknown> = {};
      headerRow.forEach((h, i) => { o[h] = (r as unknown[])[i] ?? ""; });
      return o;
    });
    setColumns(headerRow);
    setRawRows(rows);
    const guess = (re: RegExp) => headerRow.find((h) => re.test(h)) || "";
    setTitleCol(guess(/title|task|item|name/i) || headerRow[0]);
    setDescCol(guess(/desc|note/i) || NONE);
    setReqCol(guess(/required|must|mandatory/i) || NONE);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    if (files.length === 1 && /\.(xlsx|xls|csv)$/i.test(files[0].name)) {
      const file = files[0];
      setParsing(true);
      setFileName(file.name);
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        setWorkbook(wb);
        const first = wb.SheetNames[0];
        setSheetName(first);
        loadSheet(wb, first);
        if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
        setStep("configure");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to parse file");
        reset();
      } finally {
        setParsing(false);
      }
      return;
    }

    setParsing(true);
    setFileName(files.map((f) => f.name).join(", "));
    try {
      const merged: DraftItem[] = [];
      const fileNames: string[] = [];
      for (const f of files) {
        let parsed: DraftItem[] = [];
        if (/\.(xlsx|xls|csv)$/i.test(f.name)) parsed = await parseExcelAuto(f);
        else if (/\.docx$/i.test(f.name)) parsed = await parseWord(f);
        else { toast.error(`Skipping unsupported file: ${f.name}`); continue; }
        merged.push(...parsed);
        fileNames.push(f.name);
      }
      if (merged.length === 0) throw new Error("No items found in selected files");
      setItems(merged);
      setImportStats({ files: fileNames, totalParsed: merged.length });
      if (!name) setName(files[0].name.replace(/\.[^.]+$/, ""));
      setStep("preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse files");
      reset();
    } finally {
      setParsing(false);
    }
  }, [name]);

  const onSheetChange = (sn: string) => {
    if (!workbook) return;
    setSheetName(sn);
    loadSheet(workbook, sn);
  };

  const buildItemsFromMapping = (): DraftItem[] => {
    return rawRows
      .map((r) => {
        const title = String(r[titleCol] ?? "").trim();
        if (!title) return null;
        const desc = descCol !== NONE ? String(r[descCol] ?? "").trim() : "";
        const req = reqCol !== NONE ? /^(true|yes|y|1|x|required)$/i.test(String(r[reqCol]).trim()) : false;
        return { title, description: desc || undefined, is_required: req } as DraftItem;
      })
      .filter(Boolean) as DraftItem[];
  };

  const goToPreview = () => {
    if (!titleCol) { toast.error("Choose a Title column"); return; }
    const built = buildItemsFromMapping();
    if (built.length === 0) { toast.error("No items found with current mapping"); return; }
    const stamped = built.map((it) => ({ ...it, sourceFile: fileName }));
    setItems(stamped);
    setImportStats({ files: [fileName], totalParsed: stamped.length });
    setStep("preview");
  };

  const { duplicateIndices, emptyIndices, dupOf } = useMemo(() => {
    const seen = new Map<string, number>();
    const dup = new Set<number>();
    const empty = new Set<number>();
    const dupOf = new Map<number, number>();
    items.forEach((it, i) => {
      const t = normalizeTitle(it.title);
      if (!t) empty.add(i);
      else if (seen.has(t)) {
        const first = seen.get(t)!;
        dup.add(i); dup.add(first);
        dupOf.set(i, first);
      } else seen.set(t, i);
    });
    return { duplicateIndices: dup, emptyIndices: empty, dupOf };
  }, [items]);

  const updateItem = (i: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setSelected(new Set());
  };
  const removeEmpties = () => {
    setItems((prev) => prev.filter((it) => it.title.trim()));
    setSelected(new Set());
  };
  const dedupe = () => {
    const seen = new Set<string>();
    setItems((prev) => prev.filter((it) => {
      const k = normalizeTitle(it.title);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    }));
    setSelected(new Set());
  };

  const toggleSelect = (i: number) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i); else n.add(i);
      return n;
    });
  const toggleSelectAll = () =>
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((_, i) => i)));
  const bulkMarkRequired = (required: boolean) => {
    if (selected.size === 0) return;
    setItems((prev) => prev.map((it, i) => selected.has(i) ? { ...it, is_required: required } : it));
  };
  const bulkClearDescriptions = () => {
    if (selected.size === 0) return;
    setItems((prev) => prev.map((it, i) => selected.has(i) ? { ...it, description: undefined } : it));
  };
  const bulkDelete = () => {
    if (selected.size === 0) return;
    setItems((prev) => prev.filter((_, i) => !selected.has(i)));
    setSelected(new Set());
  };

  const downloadReport = () => {
    const valid = items.filter((it) => it.title.trim());
    const dupCount = duplicateIndices.size - new Set(Array.from(dupOf.values())).size;
    const lines: string[] = [];
    lines.push("Checklist Import Report");
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push(`Checklist name,"${name}"`);
    if (importStats) lines.push(`Source files,"${importStats.files.join("; ")}"`);
    lines.push("");
    lines.push("Summary");
    lines.push(`Total parsed,${items.length}`);
    lines.push(`Empty titles,${emptyIndices.size}`);
    lines.push(`Duplicates,${dupCount}`);
    lines.push(`Items to import,${valid.length - dupCount}`);
    lines.push("");
    lines.push("Row,Title,Description,Required,Source,Status");
    items.forEach((it, i) => {
      const status = emptyIndices.has(i) ? "EMPTY" : dupOf.has(i) ? `DUPLICATE of row ${dupOf.get(i)! + 1}` : "OK";
      const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
      lines.push([i + 1, esc(it.title), esc(it.description ?? ""), it.is_required ? "yes" : "no", esc(it.sourceFile ?? ""), status].join(","));
    });
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "checklist").replace(/[^a-z0-9-_]+/gi, "_")}-import-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Please provide a checklist name");
      const cleaned = items.filter((it) => it.title.trim());
      if (cleaned.length === 0) throw new Error("Add at least one item");
      const checklist = await checklistService.createChecklist({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        frequency,
        is_active: true,
      });
      for (let i = 0; i < cleaned.length; i++) {
        const it = cleaned[i];
        await checklistService.createChecklistItem({
          checklist_id: checklist.id,
          title: it.title.trim(),
          description: it.description?.trim() || undefined,
          item_type: "checkbox",
          is_required: it.is_required,
          sort_order: i,
        });
      }
      await checklistService.ensureSchedule(checklist.id, frequency);
      return checklist;
    },
    onSuccess: (c) => {
      toast.success("Checklist imported");
      navigate(`/checklists/${c.id}`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to save checklist"),
  });

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFiles(files);
  };

  const showSourceBadge = (importStats?.files.length ?? 0) > 1;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <BackToDashboard />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Checklist</h1>
          <p className="text-muted-foreground">Upload an Excel or Word document to create a new checklist.</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {(["upload", "configure", "preview"] as Step[]).map((s, i) => {
            const active = step === s;
            const done = (s === "upload" && step !== "upload") || (s === "configure" && step === "preview");
            const labels = { upload: "1. Upload", configure: "2. Map Columns", preview: "3. Preview & Save" } as const;
            const skipConfigure = isWord && s === "configure";
            return (
              <React.Fragment key={s}>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full border",
                    active && "bg-primary text-primary-foreground border-primary",
                    done && !active && "bg-muted text-foreground",
                    skipConfigure && "opacity-40 line-through",
                  )}
                >
                  {labels[s]}
                </span>
                {i < 2 && <span className="text-muted-foreground">→</span>}
              </React.Fragment>
            );
          })}
        </div>

        {step === "upload" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload File</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Excel template
                </Button>
                <Button variant="outline" size="sm" onClick={downloadWordTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Word template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                htmlFor="file-input"
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors text-center",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
                  parsing && "pointer-events-none opacity-70",
                )}
              >
                <Upload className={cn("h-10 w-10", dragActive ? "text-primary" : "text-muted-foreground")} />
                <div className="space-y-1">
                  <p className="font-medium">
                    {parsing ? "Parsing files..." : dragActive ? "Drop to upload" : "Drag & drop one or more files, or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls, .csv) or Word (.docx) — multiple files will be merged</p>
                </div>
                <Input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv,.docx"
                  multiple
                  className="hidden"
                  disabled={parsing}
                  onChange={(e) => {
                    const fs = Array.from(e.target.files || []);
                    if (fs.length) handleFiles(fs);
                    e.target.value = "";
                  }}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertTitle>Excel format</AlertTitle>
                  <AlertDescription>
                    First row should be column headers. Recommended columns: <strong>Title</strong>, <strong>Description</strong>, <strong>Required</strong> (yes/no).
                  </AlertDescription>
                </Alert>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Word format</AlertTitle>
                  <AlertDescription>
                    Each non-empty line becomes one item. Bullets and numbering (1., -, *, •) are stripped automatically.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "configure" && isExcel && workbook && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Map Columns</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">From <span className="font-medium">{fileName}</span></p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}><X className="mr-1 h-4 w-4" /> Change file</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {workbook.SheetNames.length > 1 && (
                <div className="space-y-2">
                  <Label>Sheet</Label>
                  <Select value={sheetName} onValueChange={onSheetChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {workbook.SheetNames.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Title column *</Label>
                  <Select value={titleCol} onValueChange={setTitleCol}>
                    <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description column</Label>
                  <Select value={descCol} onValueChange={setDescCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Required column</Label>
                  <Select value={reqCol} onValueChange={setReqCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {rawRows.length} row(s) detected in sheet "{sheetName}".
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={reset}>Back</Button>
                <Button onClick={goToPreview}>Preview Items</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "preview" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Checklist Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Walkthrough" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ChecklistTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ChecklistFrequencies.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Preview Items ({items.length})</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadReport}>
                    <Download className="mr-2 h-4 w-4" /> Report
                  </Button>
                  {emptyIndices.size > 0 && (
                    <Button size="sm" variant="outline" onClick={removeEmpties}>Remove empty ({emptyIndices.size})</Button>
                  )}
                  {duplicateIndices.size > 0 && (
                    <Button size="sm" variant="outline" onClick={dedupe}>Remove duplicates</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2 text-sm">
                  <Checkbox
                    checked={items.length > 0 && selected.size === items.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                  <span className="text-muted-foreground">
                    {selected.size > 0 ? `${selected.size} selected` : "Select all"}
                  </span>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={() => bulkMarkRequired(true)}>Mark required</Button>
                    <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={() => bulkMarkRequired(false)}>Mark optional</Button>
                    <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={bulkClearDescriptions}>Clear descriptions</Button>
                    <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={bulkDelete}>Delete</Button>
                  </div>
                </div>

                {(emptyIndices.size > 0 || duplicateIndices.size > 0) ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Issues found</AlertTitle>
                    <AlertDescription>
                      {emptyIndices.size > 0 && <>{emptyIndices.size} empty title(s). </>}
                      {duplicateIndices.size > 0 && <>{duplicateIndices.size} duplicate row(s). </>}
                      Review highlighted rows below.
                    </AlertDescription>
                  </Alert>
                ) : items.length > 0 ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Looks good</AlertTitle>
                    <AlertDescription>No empty or duplicate items detected.</AlertDescription>
                  </Alert>
                ) : null}

                {items.map((it, i) => (
                  <PreviewItemRow
                    key={i}
                    item={it}
                    index={i}
                    isEmpty={emptyIndices.has(i)}
                    isDuplicate={duplicateIndices.has(i)}
                    duplicateOf={dupOf.get(i)}
                    isSelected={selected.has(i)}
                    showSourceBadge={showSourceBadge}
                    onUpdate={(patch) => updateItem(i, patch)}
                    onRemove={() => removeItem(i)}
                    onToggleSelect={() => toggleSelect(i)}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(isExcel ? "configure" : "upload")}>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/checklists")}>Cancel</Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || items.filter((i) => i.title.trim()).length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? "Saving..." : "Create Checklist"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistImportPage;
