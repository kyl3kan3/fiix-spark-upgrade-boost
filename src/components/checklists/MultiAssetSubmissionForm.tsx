import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { checklistService } from "@/services/checklistService";
import { Checklist, ChecklistItem } from "@/types/checklists";
import { getAllAssets } from "@/services/assets/assetQueries";

interface Props {
 checklist: Checklist;
 onSubmitSuccess: () => void;
}

type CellValue = { is_checked?: boolean; response_value?: string };

/**
 * Renders a grid: rows = linked assets, columns = checklist items.
 * One submission covers every (asset × item) cell.
 */
const MultiAssetSubmissionForm: React.FC<Props> = ({ checklist, onSubmitSuccess }) => {
 const queryClient = useQueryClient();
 const items = (checklist.items || []).slice().sort((a, b) => a.sort_order - b.sort_order);
 const assetIds = checklist.asset_ids || [];

 const { data: allAssets = [], isLoading: loadingAssets } = useQuery({
 queryKey: ["assets"],
 queryFn: getAllAssets,
 });

 const linkedAssets = allAssets.filter((a: any) => assetIds.includes(a.id));

 // values[assetId][itemId] = CellValue
 const [values, setValues] = useState<Record<string, Record<string, CellValue>>>({});
 const [rowNotes, setRowNotes] = useState<Record<string, string>>({});
 const [submissionNotes, setSubmissionNotes] = useState("");

 useEffect(() => {
 const init: Record<string, Record<string, CellValue>> = {};
 linkedAssets.forEach((a: any) => {
 init[a.id] = {};
 items.forEach((it) => {
 init[a.id][it.id] = it.item_type === "checkbox" ? { is_checked: false } : { response_value: "" };
 });
 });
 setValues(init);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [linkedAssets.length, items.length]);

 const setCell = (assetId: string, itemId: string, patch: CellValue) => {
 setValues((prev) => ({
 ...prev,
 [assetId]: { ...(prev[assetId] || {}), [itemId]: { ...(prev[assetId]?.[itemId] || {}), ...patch } },
 }));
 };

 const submitMutation = useMutation({
 mutationFn: async () => {
 const payload: Array<{
 item_id: string;
 asset_id: string;
 is_checked?: boolean;
 response_value?: string;
 notes?: string;
 }> = [];

 for (const asset of linkedAssets) {
 for (const item of items) {
 const v = values[asset.id]?.[item.id] || {};
 payload.push({
 item_id: item.id,
 asset_id: asset.id,
 is_checked: v.is_checked,
 response_value: v.response_value,
 notes: rowNotes[asset.id] || undefined,
 });
 }
 }

 return checklistService.submitChecklist(checklist.id, payload, submissionNotes || undefined);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["checklist-submissions"] });
 queryClient.invalidateQueries({ queryKey: ["due-checklists"] });
 toast.success("Inspection submitted");
 onSubmitSuccess();
 },
 onError: (err: any) => {
 toast.error("Failed to submit", { description: err.message });
 },
 });

 const renderCell = (asset: any, item: ChecklistItem) => {
 const v = values[asset.id]?.[item.id] || {};
 switch (item.item_type) {
 case "checkbox":
 return (
 <div className="flex items-center justify-center">
 <Checkbox
 checked={!!v.is_checked}
 onCheckedChange={(c) => setCell(asset.id, item.id, { is_checked: !!c })}
 />
 </div>
 );
 case "number":
 return (
 <Input
 type="number"
 value={v.response_value || ""}
 onChange={(e) => setCell(asset.id, item.id, { response_value: e.target.value })}
 className="h-8"
 />
 );
 case "text":
 case "date":
 default:
 return (
 <Input
 value={v.response_value || ""}
 onChange={(e) => setCell(asset.id, item.id, { response_value: e.target.value })}
 className="h-8"
 />
 );
 }
 };

 if (loadingAssets) {
 return <div className="text-center py-12">Loading equipment…</div>;
 }

 if (linkedAssets.length === 0) {
 return (
 <Card className="p-6 text-center">
 <p className="text-muted-foreground">
 No equipment is linked to this checklist. Edit the checklist to link equipment.
 </p>
 </Card>
 );
 }

 return (
 <form
 onSubmit={(e) => {
 e.preventDefault();
 submitMutation.mutate();
 }}
 className="space-y-6"
 >
 <Card className="p-0 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-secondary/40">
 <tr>
 <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-secondary/40 z-10">
 Equipment
 </th>
 {items.map((it) => (
 <th key={it.id} className="px-3 py-3 text-center font-semibold whitespace-nowrap">
 <div className="flex flex-col items-center gap-1">
 <span>{it.title}</span>
 {it.is_required && (
 <Badge variant="outline" className="text-[10px]">Required</Badge>
 )}
 </div>
 </th>
 ))}
 <th className="px-3 py-3 text-left font-semibold min-w-[180px]">Notes</th>
 </tr>
 </thead>
 <tbody>
 {linkedAssets.map((asset: any) => (
 <tr key={asset.id} className="border-t">
 <td className="px-4 py-3 font-medium sticky left-0 bg-card z-10">
 {asset.name}
 </td>
 {items.map((it) => (
 <td key={it.id} className="px-3 py-2 text-center align-middle">
 {renderCell(asset, it)}
 </td>
 ))}
 <td className="px-3 py-2">
 <Input
 value={rowNotes[asset.id] || ""}
 onChange={(e) =>
 setRowNotes((prev) => ({ ...prev, [asset.id]: e.target.value }))
 }
 placeholder="Optional"
 className="h-8"
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>

 <Card className="p-6">
 <Label htmlFor="general-notes">General notes (optional)</Label>
 <Textarea
 id="general-notes"
 value={submissionNotes}
 onChange={(e) => setSubmissionNotes(e.target.value)}
 rows={3}
 className="mt-2"
 />
 </Card>

 <div className="flex justify-end">
 <Button type="submit" disabled={submitMutation.isPending} className="min-w-32">
 {submitMutation.isPending ? "Submitting…" : "Submit Inspection"}
 </Button>
 </div>
 </form>
 );
};

export default MultiAssetSubmissionForm;