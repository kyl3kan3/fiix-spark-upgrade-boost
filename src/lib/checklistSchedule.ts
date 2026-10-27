export type ChecklistScheduleSlice = {
  next_due_at: string | null;
  last_submitted_at: string | null;
};

/** Supabase may return one schedule row as an object or an array depending on the relation. */
export function normalizeChecklistSchedule(
  raw: ChecklistScheduleSlice | ChecklistScheduleSlice[] | null | undefined,
): ChecklistScheduleSlice | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export function formatChecklistNextDue(
  schedule: ChecklistScheduleSlice | ChecklistScheduleSlice[] | null | undefined,
): string | null {
  const normalized = normalizeChecklistSchedule(schedule);
  return normalized?.next_due_at ?? null;
}
