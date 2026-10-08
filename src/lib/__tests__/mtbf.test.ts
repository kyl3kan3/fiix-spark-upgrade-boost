import { describe, expect, it } from "vitest";
import {
  computeMtbf,
  DEFAULT_MTBF_INPUT,
  formatHours,
  formatPercent,
  formatRate,
  parseNumberField,
  type MtbfInput,
} from "@/lib/mtbf";

const input = (overrides: Partial<MtbfInput>): MtbfInput => ({ ...DEFAULT_MTBF_INPUT, ...overrides });

describe("computeMtbf", () => {
  it("matches the worked example used in the page copy", () => {
    const result = computeMtbf(input({ mode: "hours", operatingHours: 2000, failures: 4, downtimeHours: 18, missionHours: 168 }));
    if (result.status !== "ok") throw new Error(`expected ok, got ${result.status}`);

    expect(result.mtbfHours).toBe(500);
    expect(result.failuresPer1000Hours).toBe(2);
    expect(result.mttrHours).toBe(4.5);
    expect(formatPercent(result.availability!, 2)).toBe("99.11%");
    expect(formatPercent(result.reliability, 0)).toBe("71%");
  });

  it("subtracts repair downtime from scheduled time in schedule mode", () => {
    const result = computeMtbf(input({ mode: "schedule", hoursPerDay: 16, days: 90, machines: 1, failures: 4, downtimeHours: 18 }));
    if (result.status !== "ok") throw new Error(`expected ok, got ${result.status}`);

    expect(result.scheduledHours).toBe(1440);
    expect(result.operatingHours).toBe(1422);
    expect(result.mtbfHours).toBe(355.5);
    expect(result.mtbfOperatingDays).toBeCloseTo(22.22, 2);
  });

  it("pools identical machines, matching the multiple-machines FAQ", () => {
    const result = computeMtbf(input({ mode: "schedule", hoursPerDay: 10, days: 100, machines: 3, failures: 6, downtimeHours: null }));
    if (result.status !== "ok") throw new Error(`expected ok, got ${result.status}`);

    expect(result.operatingHours).toBe(3000);
    expect(result.mtbfHours).toBe(500);
    expect(result.mttrHours).toBeNull();
    expect(result.availability).toBeNull();
  });

  it("treats blank downtime as unknown, not zero, in hours mode", () => {
    const result = computeMtbf(input({ mode: "hours", operatingHours: 1200, failures: 3, downtimeHours: null }));
    if (result.status !== "ok") throw new Error(`expected ok, got ${result.status}`);

    expect(result.mtbfHours).toBe(400);
    expect(result.mttrHours).toBeNull();
  });

  it("refuses to invent an MTBF when there are no failures", () => {
    const result = computeMtbf(input({ mode: "hours", operatingHours: 900, failures: 0 }));
    expect(result).toEqual({ status: "no-failures", operatingHours: 900, scheduledHours: null });
  });

  it.each<[Partial<MtbfInput>, string]>([
    [{ mode: "hours", operatingHours: 0 }, "operatingHours"],
    [{ mode: "hours", operatingHours: null }, "operatingHours"],
    [{ failures: 2.5 }, "failures"],
    [{ failures: -1 }, "failures"],
    [{ downtimeHours: -3 }, "downtimeHours"],
    [{ mode: "schedule", hoursPerDay: 25 }, "hoursPerDay"],
    [{ mode: "schedule", machines: 1.5 }, "machines"],
    [{ mode: "schedule", days: 0 }, "days"],
    [{ mode: "schedule", hoursPerDay: 8, days: 1, machines: 1, downtimeHours: 8 }, "downtimeHours"],
  ])("flags invalid input %j on %s", (overrides, field) => {
    const result = computeMtbf(input(overrides));
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") expect(result.errors).toHaveProperty(field);
  });
});

describe("formatting helpers", () => {
  it("parses blanks, commas and junk", () => {
    expect(parseNumberField("")).toBeNull();
    expect(parseNumberField(" 2,000 ")).toBe(2000);
    expect(parseNumberField("abc")).toBeNaN();
  });

  it("scales precision to magnitude", () => {
    expect(formatHours(4.5)).toBe("4.5");
    expect(formatHours(355.5)).toBe("355.5");
    expect(formatHours(1422)).toBe("1,422");
    expect(formatHours(87.25)).toBe("87.3");
    expect(formatRate(2)).toBe("2");
    expect(formatRate(0.0025)).toBe("0.0025");
  });

  it("never rounds a near-certain probability to 100%", () => {
    expect(formatPercent(0.99999, 1)).toBe(">99.9%");
    expect(formatPercent(0.00001, 1)).toBe("<0.1%");
  });
});
