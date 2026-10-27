/** Calendar day (YYYY-MM-DD) for an instant in a given IANA timezone. */
export function calendarDayInTimezone(instant: string | Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(typeof instant === "string" ? new Date(instant) : instant);
  } catch {
    return new Date(instant).toISOString().slice(0, 10);
  }
}

export function isWorkOrderDueToday(
  dueIso: string,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  return calendarDayInTimezone(dueIso, timeZone) === calendarDayInTimezone(now, timeZone);
}

export function isWorkOrderOverdue(
  dueIso: string,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  const dueDay = calendarDayInTimezone(dueIso, timeZone);
  const today = calendarDayInTimezone(now, timeZone);
  return dueDay < today;
}

export function formatWorkOrderDueLabel(dueIso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      month: "short",
      day: "numeric",
    }).format(new Date(dueIso));
  } catch {
    return dueIso;
  }
}
