import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import { checklistService } from "@/services/checklistService";
import { toast } from "sonner";
import { Upload, Download, AlertTriangle, CheckCircle2, ClipboardList, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadStep } from "./checklist-import/UploadStep";
import { ConfigureStep } from "./checklist-import/ConfigureStep";
import { PreviewItemRow } from "./checklist-import/PreviewItemRow";
import { parseExcelAuto, parseWord } from "./checklist-import/parsers";
import { downloadImportReport } from "./checklist-import/importReport";
import { NONE, normalizeTitle, type DraftItem, type Step } from "./checklist-import/types";

const ChecklistImportPage: React.FC = () => {
  const navigate = useNavigate();

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [frequency, setFrequency] = useState("one-time");

  // Upload + parsing state
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Excel state
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetName, setSheetName] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [titleCol, setTitleCol] = useState<string>("");
  const [descCol, setDescCol] = useState<string>(NONE);
  const [reqCol, setReqCol] = useState<string>(NONE);

  // Word / final items
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
    const rows = aoa.slice(1).map((row) => {
      const r = row as unknown[];
      const o: Record<string, unknown> = {};
      headerRow.forEach((h, i) => { o[h] = r[i] ?? ""; });
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
    // Single Excel file → go through configure step for column mapping
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

    // Multiple files (or single Word) → auto-parse all and merge
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

  const goToPreview = () => {
    if (!titleCol) { toast.error("Choose a Title column"); return; }
    const built = rawRows
      .map((r) => {
        const title = String(r[titleCol] ?? "").trim();
        if (!title) return null;
        const desc = descCol !== NONE ? String(r[descCol] ?? "").trim() : "";
        const req = reqCol !== NONE ? /^(true|yes|y|1|x|required)$/i.test(String(r[reqCol]).trim()) : false;
        return { title, description: desc || undefined, is_required: req } as DraftItem;
      })
      .filter(Boolean) as DraftItem[];
    if (built.length === 0) { toast.error("No items found with current mapping"); return; }
    const stamped = built.map((it) => ({ ...it, sourceFile: fileName }));
    setItems(stamped);
    setImportStats({ files: [fileName], totalParsed: stamped.length });
    setStep("preview");
  };

  // Validation in preview
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
  const removeEmpties = () => { setItems((prev) => prev.filter((it) => it.title.trim())); setSelected(new Set()); };
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

  // Bulk selection / actions
  const toggleSelect = (i: number) =>
    setSelected((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
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

  return (
    <DashboardLayout>
      <PageHeader
        title="Import Checklist"
        description="Upload an Excel or Word document to create a new checklist."
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6 max-w-4xl">
        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm">
          {(["upload", "configure", "preview"] as Step[]).map((s, i) => {
            const active = step === s;
            const done =
              (s === "upload" && step !== "upload") ||
              (s === "configure" && step === "preview");
            const labels = { upload: "1. Upload", configure: "2. Map Columns", preview: "3. Preview & Save" } as const;
            const skipConfigure = isWord && s === "configure";
            return (
              <React.Fragment key={s}>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full border text-sm font-semibold",
                    active && "bg-primary text-primary-foreground border-primary",
                    done && !active && "bg-muted text-foreground border-border",
                    !active && !done && "text-muted-foreground border-border",
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
          <UploadStep
            parsing={parsing}
            dragActive={dragActive}
            setDragActive={setDragActive}
            onFiles={handleFiles}
          />
        )}

        {step === "configure" && isExcel && workbook && (
          <ConfigureStep
            fileName={fileName}
            workbook={workbook}
            sheetName={sheetName}
            columns={columns}
            rowCount={rawRows.length}
            titleCol={titleCol}
            descCol={descCol}
            reqCol={reqCol}
            onSheetChange={onSheetChange}
            onTitleColChange={setTitleCol}
            onDescColChange={setDescCol}
            onReqColChange={setReqCol}
            onReset={reset}
            onPreview={goToPreview}
          />
        )}

        {step === "preview" && (
          <>
            {/* Checklist details card */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Settings2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-headline text-lg font-semibold text-foreground">Checklist Details</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Walkthrough"
                  className="bg-muted/30 border-border/60 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-sm font-semibold text-muted-foreground">Description</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/30 border-border/60 focus-visible:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-muted/30 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ChecklistTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="bg-muted/30 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ChecklistFrequencies.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Preview items card */}
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-headline text-lg font-semibold text-foreground">
                    Preview Items ({items.length})
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImportReport({
                      items,
                      name,
                      sourceFiles: importStats?.files ?? [],
                      emptyIndices,
                      duplicateIndices,
                      dupOf,
                    })}
                  >
                    <Download className="mr-2 h-4 w-4" /> Report
                  </Button>
                  {emptyIndices.size > 0 && (
                    <Button size="sm" variant="outline" onClick={removeEmpties}>
                      Remove empty ({emptyIndices.size})
                    </Button>
                  )}
                  {duplicateIndices.size > 0 && (
                    <Button size="sm" variant="outline" onClick={dedupe}>Remove duplicates</Button>
                  )}
                </div>
              </div>

              {/* Bulk actions bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-2 text-sm">
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

              <div className="space-y-3">
                {items.map((it, i) => (
                  <PreviewItemRow
                    key={i}
                    item={it}
                    index={i}
                    isEmpty={emptyIndices.has(i)}
                    isDup={duplicateIndices.has(i)}
                    dupRow={dupOf.get(i)}
                    showSourceBadge={!!importStats && importStats.files.length > 1}
                    selected={selected.has(i)}
                    onToggleSelect={() => toggleSelect(i)}
                    onChange={(patch) => updateItem(i, patch)}
                    onRemove={() => removeItem(i)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(isExcel ? "configure" : "upload")}>Back</Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/checklists")}
                  className="uppercase tracking-wide font-semibold text-xs px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || items.filter((i) => i.title.trim()).length === 0}
                  className="uppercase tracking-wide font-semibold text-xs px-8 gap-2 shadow-sm"
                >
                  <Upload className="h-4 w-4" />
                  {saveMutation.isPending ? "Saving…" : "Create Checklist"}
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
