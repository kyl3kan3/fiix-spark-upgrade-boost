import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistItem, ChecklistSubmission, ChecklistSchedule } from "@/types/checklists";
import { requireUserCompany } from "@/services/supabaseHelpers";

type ChecklistAssetLink = { asset_id: string; start_offset_minutes?: number | null };
type ChecklistRow = Checklist & {
 asset_links?: ChecklistAssetLink[] | null;
 schedule?: ChecklistSchedule[] | ChecklistSchedule | null;
};

const mapChecklistRow = (row: ChecklistRow): Checklist => ({
 ...row,
 asset_ids: (row.asset_links ?? []).map((l) => l.asset_id),
 asset_offsets: Object.fromEntries((row.asset_links ?? []).map((l) => [l.asset_id, l.start_offset_minutes ?? 0])),
 schedule: Array.isArray(row.schedule) ? row.schedule[0] ?? null : row.schedule ?? null,
});


export const checklistService = {
 // Get all checklists
 async getChecklists(): Promise<Checklist[]> {
 const { data, error } = await supabase
 .from('checklists')
 .select(`
 *,
 items:checklist_items(*),
 schedule:checklist_schedules(*),
 asset_links:checklist_assets(asset_id, start_offset_minutes)
 `)
 .eq('is_active', true)
 .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapChecklistRow(row as unknown as ChecklistRow));
  },

 // Get checklist by ID
 async getChecklistById(id: string): Promise<Checklist | null> {
 const { data, error } = await supabase
 .from('checklists')
 .select(`
 *,
 items:checklist_items(*),
 schedule:checklist_schedules(*),
 asset_links:checklist_assets(asset_id, start_offset_minutes)
 `)
 .eq('id', id)
 .single();

  if (error) throw error;
  if (!data) return null;
  return mapChecklistRow(data as unknown as ChecklistRow);
 },

 // Create checklist - now includes frequency
 async createChecklist(checklist: Pick<Checklist, 'name' | 'description' | 'type' | 'frequency' | 'is_active'>): Promise<Checklist> {
 const { userId, companyId } = await requireUserCompany();

 const { data, error } = await supabase
 .from('checklists')
 .insert({
 ...checklist,
 company_id: companyId,
 created_by: userId,
 })
 .select()
 .single();

 if (error) throw error;
 return data as Checklist;
 },

 // Update checklist
 async updateChecklist(id: string, updates: Partial<Checklist>): Promise<Checklist> {
 const { items, asset_ids, asset_offsets, schedule, ...rest } =
 updates as Partial<Checklist> & { items?: unknown };
 const { data, error } = await supabase
 .from('checklists')
 .update(rest)
 .eq('id', id)
 .select()
 .single();

 if (error) throw error;
 return data as Checklist;
 },

 // Delete checklist
 async deleteChecklist(id: string): Promise<void> {
 const { error } = await supabase
 .from('checklists')
 .delete()
 .eq('id', id);

 if (error) throw error;
 },

 // Create checklist item
 async createChecklistItem(item: Omit<ChecklistItem, 'id' | 'created_at'>): Promise<ChecklistItem> {
 const { data, error } = await supabase
 .from('checklist_items')
 .insert(item)
 .select()
 .single();

 if (error) throw error;
 return data as ChecklistItem;
 },

 // Update checklist item
 async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
 const { data, error } = await supabase
 .from('checklist_items')
 .update(updates)
 .eq('id', id)
 .select()
 .single();

 if (error) throw error;
 return data as ChecklistItem;
 },

 // Delete checklist item
 async deleteChecklistItem(id: string): Promise<void> {
 const { error } = await supabase
 .from('checklist_items')
 .delete()
 .eq('id', id);

 if (error) throw error;
 },

 // Submit checklist
 async submitChecklist(
 checklistId: string, 
 items: Array<{ item_id: string; response_value?: string; is_checked?: boolean; notes?: string; asset_id?: string | null }>,
 notes?: string
 ): Promise<ChecklistSubmission> {
 const { data, error } = await supabase.rpc('submit_checklist_atomic', {
 _checklist_id: checklistId,
 _items: items.map((item) => ({
 item_id: item.item_id,
 response_value: item.response_value ?? null,
 is_checked: item.is_checked ?? null,
 notes: item.notes ?? null,
 asset_id: item.asset_id ?? null,
 })),
 _notes: notes,
 });

 if (error) throw error;
 if (!data) throw new Error("Checklist submission did not return a result");
 return data as unknown as ChecklistSubmission;
 },

 // Get submissions
 async getSubmissions(): Promise<ChecklistSubmission[]> {
 const { data, error } = await supabase
 .from('checklist_submissions')
 .select(`
 *,
 checklist:checklists(*),
 items:checklist_submission_items(
 *,
 checklist_item:checklist_items(*)
 )
 `)
 .order('submitted_at', { ascending: false });

 if (error) throw error;
 return (data || []) as ChecklistSubmission[];
 },

 // ---------- Asset links ----------
 async setChecklistAssets(
 checklistId: string,
 assetIds: string[],
 options?: {
 /** Per-asset offset in minutes from the checklist's base due time. */
 offsets?: Record<string, number>;
 /** Auto-stagger evenly across the day (minutes between assets). Used when offsets is not provided. */
 autoStaggerMinutes?: number;
 },
 ): Promise<void> {
 // Replace links: delete all then insert. (small N, simple & correct)
 const { error: delErr } = await supabase
 .from('checklist_assets')
 .delete()
 .eq('checklist_id', checklistId);
 if (delErr) throw delErr;

 if (assetIds.length === 0) return;
 const stagger = options?.autoStaggerMinutes;
 const rows = assetIds.map((asset_id, i) => ({
 checklist_id: checklistId,
 asset_id,
 start_offset_minutes:
 options?.offsets?.[asset_id] ?? (stagger ? i * stagger : 0),
 }));
 const { error: insErr } = await supabase
 .from('checklist_assets')
 .insert(rows);
 if (insErr) throw insErr;
 },

 /** Update only the staggered start offset for one asset on a checklist. */
 async updateChecklistAssetOffset(
 checklistId: string,
 assetId: string,
 minutes: number,
 ): Promise<void> {
 const { error } = await supabase
 .from('checklist_assets')
 .update({ start_offset_minutes: Math.max(0, Math.round(minutes)) })
 .eq('checklist_id', checklistId)
 .eq('asset_id', assetId);
 if (error) throw error;
 },

 // ---------- Schedules ----------
 async ensureSchedule(checklistId: string, _frequency: string): Promise<void> {
 const { error } = await supabase.rpc('set_checklist_schedule', {
 _checklist_id: checklistId,
 });
 if (error) throw error;
 },

 async rollSchedule(checklistId: string): Promise<void> {
 const { error } = await supabase.rpc('set_checklist_schedule', {
 _checklist_id: checklistId,
 });
 if (error) throw error;
 },

 async getDueChecklists(): Promise<Checklist[]> {
 const nowIso = new Date().toISOString();
 const { data, error } = await supabase
 .from('checklists')
 .select(`
 *,
 items:checklist_items(*),
 schedule:checklist_schedules!inner(*),
 asset_links:checklist_assets(asset_id)
 `)
 .eq('is_active', true)
 .lte('schedule.next_due_at', nowIso)
 .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapChecklistRow(row as unknown as ChecklistRow));
  },

 /**
 * All scheduled checklists with their next-due time, sorted by soonest.
 * Used by the Due dashboard to bucket into overdue / today / upcoming.
 */
 async getScheduledChecklists(): Promise<Checklist[]> {
 const { data, error } = await supabase
 .from('checklists')
 .select(`
 *,
 items:checklist_items(*),
 schedule:checklist_schedules!inner(*),
 asset_links:checklist_assets(asset_id)
 `)
 .eq('is_active', true)
 .order('next_due_at', { foreignTable: 'checklist_schedules', ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapChecklistRow(row as unknown as ChecklistRow));
  },
};

export interface RecurringChecklistSummary {
  id: string;
  name: string;
  frequency: string | null;
  schedule: { next_due_at: string | null; last_submitted_at: string | null } | null;
}

type RecurringChecklistRow = {
  id: string;
  name: string;
  frequency: string | null;
  checklist_schedules:
    | { next_due_at: string | null; last_submitted_at: string | null }[]
    | null;
};

/**
 * Active, non-one-time checklists with their schedule, sorted by name.
 * Powers the Automations page list of recurring checklists.
 */
export async function listRecurringChecklists(): Promise<RecurringChecklistSummary[]> {
  const { data, error } = await supabase
    .from("checklists")
    .select("id, name, frequency, checklist_schedules(next_due_at, last_submitted_at)")
    .eq("is_active", true)
    .neq("frequency", "one-time")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as unknown as RecurringChecklistRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    frequency: c.frequency,
    schedule: c.checklist_schedules?.[0] || null,
  }));
}
