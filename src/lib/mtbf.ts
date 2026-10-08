/**
 * Pure math behind the /tools/mtbf-calculator page.
 *
 * MTBF = operating time / failures. Two ways to supply operating time:
 *  - "hours": the user already knows total operating (up) time.
 *  - "schedule": hours per day x days x identical machines, minus repair
 *    downtime, because a machine is not operating while it is down for repair.
 *
 * Optional repair downtime adds MTTR and inherent availability. The
 * failure-free probability uses R(t) = e^(-t / MTBF), which assumes a constant
 * failure rate; the page copy states that assumption next to the number.
 */

export type MtbfMode = "hours" | "schedule";

export type MtbfField =
  | "operatingHours"
  | "hoursPerDay"
  | "days"
  | "machines"
  | "failures"
  | "downtimeHours";

export interface MtbfInput {
  mode: MtbfMode;
  operatingHours: number | null;
  hoursPerDay: number | null;
  days: number | null;
  machines: number | null;
  failures: number | null;
  /** Total corrective downtime in hours across all machines. Optional. */
  downtimeHours: number | null;
  /** Operating hours to test the failure-free probability over. */
  missionHours: number;
}

export type MtbfResult =
  | { status: "invalid"; errors: Partial<Record<MtbfField, string>> }
  | {
      status: "no-failures";
      operatingHours: number;
      scheduledHours: number | null;
    }
  | {
      status: "ok";
      operatingHours: number;
      /** Scheduled hours before downtime is removed (schedule mode only). */
      scheduledHours: number | null;
      failures: number;
      mtbfHours: number;
      /** MTBF expressed as operating days per machine (schedule mode only). */
      mtbfOperatingDays: number | null;
      failuresPer1000Hours: number;
      mttrHours: number | null;
      /** Inherent availability, 0 to 1. Null without downtime. */
      availability: number | null;
      missionHours: number;
      /** Probability of zero failures over missionHours, 0 to 1. */
      reliability: number;
    };

export const MISSION_PRESETS = [8, 40, 168, 720] as const;

export const DEFAULT_MTBF_INPUT: MtbfInput = {
  mode: "hours",
  operatingHours: 2000,
  hoursPerDay: 16,
  days: 90,
  machines: 1,
  failures: 4,
  downtimeHours: 18,
  missionHours: 168,
};

const isFiniteNumber = (value: number | null): value is number =>
  value !== null && Number.isFinite(value);

/** Parse a text field. Empty means "not provided"; commas are tolerated. */
export const parseNumberField = (raw: string): number | null => {
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : Number.NaN;
};

export function computeMtbf(input: MtbfInput): MtbfResult {
  const errors: Partial<Record<MtbfField, string>> = {};

  let scheduledHours: number | null = null;
  let grossHours: number | null = null;

  if (input.mode === "hours") {
    if (!isFiniteNumber(input.operatingHours) || input.operatingHours <= 0) {
      errors.operatingHours = "Enter operating hours greater than 0.";
    } else {
      grossHours = input.operatingHours;
    }
  } else {
    if (!isFiniteNumber(input.hoursPerDay) || input.hoursPerDay <= 0 || input.hoursPerDay > 24) {
      errors.hoursPerDay = "Use a value above 0, up to 24.";
    }
    if (!isFiniteNumber(input.days) || input.days <= 0) {
      errors.days = "Enter at least 1 day.";
    }
    if (!isFiniteNumber(input.machines) || input.machines < 1 || !Number.isInteger(input.machines)) {
      errors.machines = "Use a whole number, 1 or more.";
    }
    if (!errors.hoursPerDay && !errors.days && !errors.machines) {
      scheduledHours = input.hoursPerDay! * input.days! * input.machines!;
    }
  }

  if (!isFiniteNumber(input.failures) || input.failures < 0 || !Number.isInteger(input.failures)) {
    errors.failures = "Use a whole number, 0 or more.";
  }

  const downtime = input.downtimeHours;
  if (downtime !== null && (!Number.isFinite(downtime) || downtime < 0)) {
    errors.downtimeHours = "Leave blank or enter 0 or more.";
  }

  if (input.mode === "schedule" && scheduledHours !== null && !errors.downtimeHours) {
    const down = downtime ?? 0;
    if (down >= scheduledHours) {
      errors.downtimeHours = "Downtime must be less than the scheduled hours.";
    } else {
      grossHours = scheduledHours - down;
    }
  }

  if (Object.keys(errors).length > 0 || grossHours === null) {
    return { status: "invalid", errors };
  }

  const operatingHours = grossHours;
  const failures = input.failures!;

  if (failures === 0) {
    return { status: "no-failures", operatingHours, scheduledHours };
  }

  const mtbfHours = operatingHours / failures;
  const mttrHours = downtime !== null ? downtime / failures : null;
  const availability = mttrHours !== null ? mtbfHours / (mtbfHours + mttrHours) : null;
  const missionHours = Math.max(0, input.missionHours);

  return {
    status: "ok",
    operatingHours,
    scheduledHours,
    failures,
    mtbfHours,
    mtbfOperatingDays: input.mode === "schedule" ? mtbfHours / input.hoursPerDay! : null,
    failuresPer1000Hours: (failures / operatingHours) * 1000,
    mttrHours,
    availability,
    missionHours,
    reliability: Math.exp(-missionHours / mtbfHours),
  };
}

const fmt = (value: number, maximumFractionDigits: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);

/** Hours with precision that matches magnitude: 4.5, 355.5, 1,422. */
export const formatHours = (hours: number): string =>
  fmt(hours, hours < 10 ? 2 : hours < 1000 ? 1 : 0);

export const formatRate = (value: number): string =>
  fmt(value, value < 0.1 ? 4 : value < 10 ? 2 : 1);

export const formatPercent = (ratio: number, digits = 1): string => {
  const pct = ratio * 100;
  const floor = 10 ** -digits;
  if (pct > 0 && pct < floor) return `<${floor}%`;
  if (pct < 100 && pct > 100 - floor) return `>${fmt(100 - floor, digits)}%`;
  return `${fmt(pct, digits)}%`;
};
