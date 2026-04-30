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