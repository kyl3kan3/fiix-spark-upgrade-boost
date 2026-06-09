import { describe, expect, it } from "vitest";
import { buildPmOccurrenceDates } from "../workOrderService";

const START = new Date("2026-06-15T09:00:00.000Z");

describe("buildPmOccurrenceDates", () => {
 it("returns just the start date when there is no frequency", () => {
 expect(buildPmOccurrenceDates(START)).toEqual([START]);
 });

 it("returns just the start date for a non-positive frequency", () => {
 expect(buildPmOccurrenceDates(START, { value: 0, unit: "days" })).toEqual([START]);
 });

 it("generates monthly occurrences within the 6-month horizon", () => {
 const dates = buildPmOccurrenceDates(START, { value: 1, unit: "months" });
 expect(dates).toHaveLength(7); // start + 6 monthly repeats, inclusive horizon
 expect(dates[0]).toEqual(START);
 expect(dates[1].getMonth()).toBe((START.getMonth() + 1) % 12);
 });

 it("caps high-frequency schedules at 12 occurrences", () => {
 const dates = buildPmOccurrenceDates(START, { value: 1, unit: "days" });
 expect(dates).toHaveLength(12);
 });

 it("yields a single occurrence when the interval exceeds the horizon", () => {
 const dates = buildPmOccurrenceDates(START, { value: 1, unit: "years" });
 expect(dates).toEqual([START]);
 });

 it("keeps occurrences strictly ordered", () => {
 const dates = buildPmOccurrenceDates(START, { value: 2, unit: "weeks" });
 for (let i = 1; i < dates.length; i++) {
 expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime());
 }
 });
});
