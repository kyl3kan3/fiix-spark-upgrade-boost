import { describe, expect, it } from "vitest";
import {
  calendarDayInTimezone,
  formatWorkOrderDueLabel,
  isWorkOrderDueToday,
  isWorkOrderOverdue,
} from "../workOrderDueDate";

describe("workOrderDueDate", () => {
  const chicago = "America/Chicago";

  it("treats UTC-midnight Oct 27 as Oct 26 in Central for overdue (legacy bug)", () => {
    const utcMidnightOct27 = "2026-10-27T00:00:00.000Z";
    expect(calendarDayInTimezone(utcMidnightOct27, chicago)).toBe("2026-10-26");
    expect(isWorkOrderOverdue(utcMidnightOct27, chicago, new Date("2026-10-27T15:00:00.000Z"))).toBe(
      true,
    );
  });

  it("treats noon Central Oct 27 as due Oct 27 in Central", () => {
    const noonCentralOct27 = "2026-10-27T17:00:00.000Z";
    expect(calendarDayInTimezone(noonCentralOct27, chicago)).toBe("2026-10-27");
    expect(
      isWorkOrderOverdue(noonCentralOct27, chicago, new Date("2026-10-27T15:00:00.000Z")),
    ).toBe(false);
    expect(isWorkOrderDueToday(noonCentralOct27, chicago, new Date("2026-10-27T20:00:00.000Z"))).toBe(
      true,
    );
  });

  it("formats due label in company timezone", () => {
    expect(formatWorkOrderDueLabel("2026-10-27T17:00:00.000Z", chicago)).toMatch(/Oct 27/);
  });
});
