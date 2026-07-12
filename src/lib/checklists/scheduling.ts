/**
 * Returns the next due timestamp in UTC for client-side previews and tests,
 * starting from `from` (defaults to now). Persisted schedules are calculated
 * by Postgres in the company's configured IANA timezone.
 * Returns `null` for one-time checklists (no recurring due).
 */
export function nextDueAt(frequency: string, from: Date = new Date()): Date | null {
 const d = new Date(from);
 switch (frequency) {
 case "twice-daily": {
 // If currently AM (before noon), next due is today PM (noon).
 // If currently PM, next due is tomorrow AM (start of day).
 const next = new Date(d);
 if (d.getUTCHours() < 12) {
 next.setUTCHours(12, 0, 0, 0);
 } else {
 next.setUTCDate(next.getUTCDate() + 1);
 next.setUTCHours(0, 0, 0, 0);
 }
 return next;
 }
 case "daily": {
 const next = new Date(d);
 next.setUTCDate(next.getUTCDate() + 1);
 next.setUTCHours(0, 0, 0, 0);
 return next;
 }
 case "weekly": {
 const next = new Date(d);
 next.setUTCDate(next.getUTCDate() + 7);
 return next;
 }
 case "biweekly": {
 const next = new Date(d);
 next.setUTCDate(next.getUTCDate() + 14);
 return next;
 }
 case "monthly": {
 return addUtcMonthsClamped(d, 1);
 }
 case "quarterly": {
 return addUtcMonthsClamped(d, 3);
 }
 case "annually": {
 return addUtcMonthsClamped(d, 12);
 }
 case "one-time":
 default:
 return null;
 }
}

function addUtcMonthsClamped(from: Date, months: number): Date {
 const next = new Date(from);
 const dayOfMonth = next.getUTCDate();
 next.setUTCDate(1);
 next.setUTCMonth(next.getUTCMonth() + months);
 const lastDay = new Date(Date.UTC(
 next.getUTCFullYear(),
 next.getUTCMonth() + 1,
 0,
 )).getUTCDate();
 next.setUTCDate(Math.min(dayOfMonth, lastDay));
 return next;
}

export function isDue(nextDueAtIso: string | null | undefined, now: Date = new Date()): boolean {
 if (!nextDueAtIso) return false;
 return new Date(nextDueAtIso).getTime() <= now.getTime();
}

/**
 * Given the checklist's base due time and a per-asset offset (in minutes),
 * return when this specific asset's prompt should activate.
 */
export function assetDueAt(
 baseDueAtIso: string | null | undefined,
 offsetMinutes: number = 0,
): Date | null {
 if (!baseDueAtIso) return null;
 const base = new Date(baseDueAtIso);
 if (Number.isNaN(base.getTime())) return null;
 return new Date(base.getTime() + Math.max(0, offsetMinutes) * 60_000);
}

/**
 * Filter a checklist's assets down to the ones currently due, considering
 * per-asset stagger offsets. Returns the asset IDs whose offset window has elapsed.
 */
export function dueAssetIds(
 baseDueAtIso: string | null | undefined,
 assetIds: string[] = [],
 offsets: Record<string, number> = {},
 now: Date = new Date(),
): string[] {
 if (!baseDueAtIso) return [];
 const baseMs = new Date(baseDueAtIso).getTime();
 if (Number.isNaN(baseMs)) return [];
 const nowMs = now.getTime();
 return assetIds.filter((id) => {
 const off = Math.max(0, offsets[id] ?? 0);
 return baseMs + off * 60_000 <= nowMs;
 });
}
