/**
 * Returns the next due timestamp for a checklist given its frequency,
 * starting from `from` (defaults to now).
 * Returns `null` for one-time checklists (no recurring due).
 */
export function nextDueAt(frequency: string, from: Date = new Date()): Date | null {
  const d = new Date(from);
  switch (frequency) {
    case "twice-daily": {
      // If currently AM (before noon), next due is today PM (noon).
      // If currently PM, next due is tomorrow AM (start of day).
      const next = new Date(d);
      if (d.getHours() < 12) {
        next.setHours(12, 0, 0, 0);
      } else {
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
      }
      return next;
    }
    case "daily": {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      return next;
    }
    case "weekly": {
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    }
    case "biweekly": {
      const next = new Date(d);
      next.setDate(next.getDate() + 14);
      return next;
    }
    case "monthly": {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    case "quarterly": {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 3);
      return next;
    }
    case "annually": {
      const next = new Date(d);
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }
    case "one-time":
    default:
      return null;
  }
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