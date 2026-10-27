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

/** Store a date-only due (YYYY-MM-DD) as noon in the company timezone (timestamptz ISO). */
export function workOrderDueInstantFromDateInput(dateOnly: string, timeZone: string): string {
  const trimmed = dateOnly.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }
  const dayStartUtc = new Date(`${trimmed}T00:00:00.000Z`);
  for (let offsetHours = 0; offsetHours < 48; offsetHours += 1) {
    const candidate = new Date(dayStartUtc.getTime() + offsetHours * 3_600_000);
    if (calendarDayInTimezone(candidate.toISOString(), timeZone) !== trimmed) continue;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(candidate);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? -1);
    if (hour === 12 && minute === 0) return candidate.toISOString();
  }
  return new Date(`${trimmed}T12:00:00.000Z`).toISOString();
}

/** Date input value (YYYY-MM-DD) for an existing due timestamp in company TZ. */
export function workOrderDueDateInputValue(dueIso: string, timeZone: string): string {
  return calendarDayInTimezone(dueIso, timeZone);
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
