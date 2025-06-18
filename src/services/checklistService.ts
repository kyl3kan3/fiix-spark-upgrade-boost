import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistItem, ChecklistSubmission, ChecklistSubmissionItem } from "@/types/checklists";

export const checklistService = {
  // Get all checklists
  async getChecklists(): Promise<Checklist[]> {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Checklist[];
  },

  // Get checklist by ID
  async getChecklistById(id: string): Promise<Checklist | null> {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Checklist;
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
    const { data, error } = await supabase
      .from('checklists')
      .update(updates)
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
    items: Array<{ item_id: string; response_value?: string; is_checked?: boolean; notes?: string }>,
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
    }));

    const { error: itemsError } = await supabase
      .from('checklist_submission_items')
      .insert(submissionItems);

    if (itemsError) throw itemsError;

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
};
