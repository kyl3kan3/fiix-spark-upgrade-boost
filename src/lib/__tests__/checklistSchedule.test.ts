import { describe, expect, it } from "vitest";
import { formatChecklistNextDue, normalizeChecklistSchedule } from "../checklistSchedule";

describe("checklistSchedule", () => {
  it("normalizes array or object schedule shapes", () => {
    const row = { next_due_at: "2026-11-27T12:00:00Z", last_submitted_at: null };
    expect(normalizeChecklistSchedule([row])?.next_due_at).toBe(row.next_due_at);
    expect(normalizeChecklistSchedule(row)?.next_due_at).toBe(row.next_due_at);
    expect(formatChecklistNextDue([row])).toBe(row.next_due_at);
  });
});
