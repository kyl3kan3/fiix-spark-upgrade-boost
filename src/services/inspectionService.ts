import { Inspection } from "@/types/inspections";
import { Checklist, ChecklistSubmission } from "@/types/checklists";
import { checklistService } from "@/services/checklistService";
import { supabase } from "@/integrations/supabase/client";

/**
 * A "check-up" (inspection) is a view over the checklists machinery:
 * upcoming check-ups come from checklist schedules, completed ones from
 * checklist submissions. There is no separate inspections table.
 */

const DUE_ID_PREFIX = "due-";

/** Scheduled (not yet run) check-ups get a `due-<checklistId>` id. */
export const checklistIdFromInspectionId = (inspectionId: string): string | null =>
 inspectionId.startsWith(DUE_ID_PREFIX) ? inspectionId.slice(DUE_ID_PREFIX.length) : null;

const scheduledToInspection = (
 checklist: Checklist,
 assetNames: Map<string, string>,
): Inspection => {
 const firstAsset = checklist.asset_ids?.[0];
 const extraAssets = (checklist.asset_ids?.length ?? 0) - 1;
 const assetName = firstAsset
 ? `${assetNames.get(firstAsset) ?? "Asset"}${extraAssets > 0 ? ` +${extraAssets} more` : ""}`
 : "All assets";

 return {
 id: `${DUE_ID_PREFIX}${checklist.id}`,
 title: checklist.name,
 description: checklist.description || "",
 assetId: firstAsset || "",
 assetName,
 status: "scheduled",
 priority: checklist.type === "safety" ? "high" : "medium",
 assignedTo: "Anyone on the team",
 scheduledDate: checklist.schedule?.next_due_at as string,
 items: [...(checklist.items || [])]
 .sort((a, b) => a.sort_order - b.sort_order)
 .map((item) => ({ id: item.id, name: item.title, passed: null, notes: "" })),
 };
};

const submissionToInspection = (
 submission: ChecklistSubmission,
 submitterNames: Map<string, string>,
): Inspection => ({
 id: submission.id,
 title: submission.checklist?.name || "Check-up",
 description: submission.notes || submission.checklist?.description || "",
 assetId: "",
 assetName: submission.checklist?.type
 ? submission.checklist.type.charAt(0).toUpperCase() + submission.checklist.type.slice(1)
 : "—",
 status: "completed",
 priority: submission.checklist?.type === "safety" ? "high" : "medium",
 assignedTo: submitterNames.get(submission.submitted_by) || "Team member",
 scheduledDate: submission.submitted_at,
 completedDate: submission.submitted_at,
 items: (submission.items || []).map((item) => ({
 id: item.id,
 name: item.checklist_item?.title || "Step",
 passed: item.is_checked ?? null,
 notes: item.notes || "",
 })),
});

export const fetchInspections = async (): Promise<{
 data: Inspection[];
 error: Error | null;
}> => {
 try {
 const [scheduled, submissions] = await Promise.all([
 checklistService.getScheduledChecklists(),
 checklistService.getSubmissions(),
 ]);

 const assetIds = [...new Set(scheduled.flatMap((c) => c.asset_ids || []))];
 const submitterIds = [...new Set(submissions.map((s) => s.submitted_by))];

 const [assetRows, profileRows] = await Promise.all([
 assetIds.length
 ? supabase.from("assets").select("id, name").in("id", assetIds)
 : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
 submitterIds.length
 ? supabase.from("profiles").select("id, first_name, last_name").in("id", submitterIds)
 : Promise.resolve({ data: [] as Array<{ id: string; first_name: string | null; last_name: string | null }> }),
 ]);

 const assetNames = new Map((assetRows.data || []).map((a) => [a.id, a.name]));
 const submitterNames = new Map(
 (profileRows.data || []).map((p) => [
 p.id,
 `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Team member",
 ]),
 );

 const upcoming = scheduled
 .filter((c) => c.schedule?.next_due_at)
 .map((c) => scheduledToInspection(c, assetNames));
 const completed = submissions.map((s) => submissionToInspection(s, submitterNames));

 return { data: [...upcoming, ...completed], error: null };
 } catch (err) {
 console.error("Error fetching inspections:", err);
 return {
 data: [],
 error: err instanceof Error ? err : new Error("Failed to load check-ups"),
 };
 }
};
