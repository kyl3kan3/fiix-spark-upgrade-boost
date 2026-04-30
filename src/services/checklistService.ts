import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistItem, ChecklistSubmission, ChecklistSchedule } from "@/types/checklists";
import { nextDueAt } from "@/lib/checklists/scheduling";

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
    return (data || []).map((row: any) => ({
      ...row,
      asset_ids: (row.asset_links || []).map((l: any) => l.asset_id),
      asset_offsets: Object.fromEntries(
        (row.asset_links || []).map((l: any) => [l.asset_id, l.start_offset_minutes ?? 0]),
      ),
      schedule: Array.isArray(row.schedule) ? row.schedule[0] || null : row.schedule || null,
    })) as Checklist[];
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
    const row: any = data;
    return {
      ...row,
      asset_ids: (row.asset_links || []).map((l: any) => l.asset_id),
      asset_offsets: Object.fromEntries(
        (row.asset_links || []).map((l: any) => [l.asset_id, l.start_offset_minutes ?? 0]),
      ),
      schedule: Array.isArray(row.schedule) ? row.schedule[0] || null : row.schedule || null,
    } as Checklist;
  },

  // Create checklist - now includes frequency
  async createChecklist(checklist: Pick<Checklist, 'name' | 'description' | 'type' | 'frequency' | 'is_active'>): Promise<Checklist> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('checklists')
      .insert({
        ...checklist,
        company_id: profile?.company_id,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Checklist;
  },

  // Update checklist
  async updateChecklist(id: string, updates: Partial<Checklist>): Promise<Checklist> {
    const { items, ...rest } = updates as Partial<Checklist> & { items?: unknown };
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
    const { data: { user } } = await supabase.auth.getUser();

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('checklist_submissions')
      .insert({
        checklist_id: checklistId,
        submitted_by: user?.id,
        notes,
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Create submission items
    const submissionItems = items.map(item => ({
      submission_id: submission.id,
      checklist_item_id: item.item_id,
      response_value: item.response_value,
      is_checked: item.is_checked,
      notes: item.notes,
      asset_id: item.asset_id ?? null,
    }));

    const { error: itemsError } = await supabase
      .from('checklist_submission_items')
      .insert(submissionItems);

    if (itemsError) throw itemsError;

    // Roll the schedule forward
    await checklistService.rollSchedule(checklistId);

    return submission as ChecklistSubmission;
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
  async setChecklistAssets(checklistId: string, assetIds: string[]): Promise<void> {
    // Replace links: delete all then insert. (small N, simple & correct)
    const { error: delErr } = await supabase
      .from('checklist_assets')
      .delete()
      .eq('checklist_id', checklistId);
    if (delErr) throw delErr;

    if (assetIds.length === 0) return;
    const rows = assetIds.map(asset_id => ({ checklist_id: checklistId, asset_id }));
    const { error: insErr } = await supabase
      .from('checklist_assets')
      .insert(rows);
    if (insErr) throw insErr;
  },

  // ---------- Schedules ----------
  async ensureSchedule(checklistId: string, frequency: string): Promise<void> {
    const next = nextDueAt(frequency, new Date());
    // Try update first; if no row exists, insert.
    const { data: existing, error: selErr } = await supabase
      .from('checklist_schedules')
      .select('id')
      .eq('checklist_id', checklistId)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
      const { error } = await supabase
        .from('checklist_schedules')
        .update({ next_due_at: next ? next.toISOString() : null })
        .eq('checklist_id', checklistId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('checklist_schedules')
        .insert({
          checklist_id: checklistId,
          next_due_at: next ? next.toISOString() : null,
        });
      if (error) throw error;
    }
  },

  async rollSchedule(checklistId: string): Promise<void> {
    // Look up checklist frequency, then push next_due_at forward.
    const { data: cl, error: clErr } = await supabase
      .from('checklists')
      .select('frequency')
      .eq('id', checklistId)
      .single();
    if (clErr) throw clErr;

    const next = nextDueAt(cl.frequency, new Date());
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from('checklist_schedules')
      .select('id')
      .eq('checklist_id', checklistId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('checklist_schedules')
        .update({
          next_due_at: next ? next.toISOString() : null,
          last_submitted_at: now,
        })
        .eq('checklist_id', checklistId);
    } else {
      await supabase
        .from('checklist_schedules')
        .insert({
          checklist_id: checklistId,
          next_due_at: next ? next.toISOString() : null,
          last_submitted_at: now,
        });
    }
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
    return (data || []).map((row: any) => ({
      ...row,
      asset_ids: (row.asset_links || []).map((l: any) => l.asset_id),
      schedule: Array.isArray(row.schedule) ? row.schedule[0] || null : row.schedule || null,
    })) as Checklist[];
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
    return (data || []).map((row: any) => ({
      ...row,
      asset_ids: (row.asset_links || []).map((l: any) => l.asset_id),
      schedule: Array.isArray(row.schedule) ? row.schedule[0] || null : row.schedule || null,
    })) as Checklist[];
  },
};
