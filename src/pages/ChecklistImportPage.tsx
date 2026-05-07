import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistTypes, ChecklistFrequencies } from "@/types/checklists";
import { checklistService } from "@/services/checklistService";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

type DraftItem = { title: string; description?: string; is_required: boolean };

async function parseExcel(file: File): Promise<DraftItem[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
  if (rows.length === 0) {
    // try as array of arrays
    const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    return aoa
      .map((r) => String(r?.[0] ?? "").trim())
      .filter(Boolean)
      .map((title) => ({ title, is_required: false }));
  }
  return rows
    .map((r) => {
      const titleKey = Object.keys(r).find((k) => /title|task|item|name/i.test(k)) || Object.keys(r)[0];
      const descKey = Object.keys(r).find((k) => /desc|note/i.test(k));
      const reqKey = Object.keys(r).find((k) => /required|must/i.test(k));
      const title = String(r[titleKey] ?? "").trim();
      if (!title) return null;
      return {
        title,
        description: descKey ? String(r[descKey] ?? "").trim() || undefined : undefined,
        is_required: reqKey ? /^(true|yes|y|1|x)$/i.test(String(r[reqKey]).trim()) : false,
      } as DraftItem;
    })
    .filter(Boolean) as DraftItem[];
}

async function parseWord(file: File): Promise<DraftItem[]> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-\*\u2022\d\.\)\(]+/, "").trim())
    .filter((l) => l.length > 0)
    .map((title) => ({ title, is_required: false }));
}

const ChecklistImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [frequency, setFrequency] = useState("one-time");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [parsing, setParsing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      let parsed: DraftItem[] = [];
      if (/\.(xlsx|xls|csv)$/i.test(file.name)) parsed = await parseExcel(file);
      else if (/\.docx$/i.test(file.name)) parsed = await parseWord(file);
      else throw new Error("Unsupported file type. Use .xlsx, .xls, .csv, or .docx");
      if (parsed.length === 0) throw new Error("No items found in the file");
      setItems(parsed);
      if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
      toast.success(`Found ${parsed.length} items`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to parse file");
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  };

  const updateItem = (i: number, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Please provide a checklist name");
      if (items.length === 0) throw new Error("Add at least one item");
      const checklist = await checklistService.createChecklist({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        frequency,
        is_active: true,
      });
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.title.trim()) continue;
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
    onError: (e: any) => toast.error(e?.message || "Failed to save checklist"),
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <BackToDashboard />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Checklist</h1>
          <p className="text-muted-foreground">Upload an Excel or Word document to create a new checklist.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="file">Excel (.xlsx, .xls, .csv) or Word (.docx)</Label>
            <Input id="file" type="file" accept=".xlsx,.xls,.csv,.docx" onChange={handleFile} disabled={parsing} />
            <p className="text-sm text-muted-foreground">
              Excel: first column or a "Title" column becomes each item. Word: each non-empty line becomes an item.
            </p>
          </CardContent>
        </Card>

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
                    {ChecklistTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ChecklistFrequencies.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-start gap-2 border rounded-md p-2">
                  <div className="flex items-center pt-2">
                    <Checkbox
                      checked={it.is_required}
                      onCheckedChange={(v) => updateItem(i, { is_required: Boolean(v) })}
                      title="Required"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input value={it.title} onChange={(e) => updateItem(i, { title: e.target.value })} />
                    {it.description !== undefined && (
                      <Input
                        value={it.description}
                        onChange={(e) => updateItem(i, { description: e.target.value })}
                        placeholder="Description"
                      />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/checklists")}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || items.length === 0}>
            <Upload className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Create Checklist"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChecklistImportPage;