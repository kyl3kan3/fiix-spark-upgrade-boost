import { describe, it, expect } from "vitest";
import {
  clamp01,
  clampAngle,
  relativeFromPointer,
  planeTransform,
  markerCounterTransform,
  toPercent,
} from "@/lib/floorPlan";

describe("floorPlan.clamp01", () => {
  it("clamps into [0,1] and handles NaN", () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(NaN)).toBe(0);
  });
});

describe("floorPlan.clampAngle", () => {
  it("clamps within bounds", () => {
    expect(clampAngle(100, 0, 75)).toBe(75);
    expect(clampAngle(-200, -180, 180)).toBe(-180);
    expect(clampAngle(30, 0, 75)).toBe(30);
  });
});

describe("floorPlan.relativeFromPointer", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("maps a pointer to relative coords", () => {
    expect(relativeFromPointer(rect, 200, 100)).toEqual({ x: 0.5, y: 0.5 });
    expect(relativeFromPointer(rect, 100, 50)).toEqual({ x: 0, y: 0 });
    expect(relativeFromPointer(rect, 300, 150)).toEqual({ x: 1, y: 1 });
  });
  it("clamps points outside the rect", () => {
    expect(relativeFromPointer(rect, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(relativeFromPointer(rect, 9999, 9999)).toEqual({ x: 1, y: 1 });
  });
  it("falls back to center for a zero-size rect", () => {
    expect(relativeFromPointer({ left: 0, top: 0, width: 0, height: 0 }, 5, 5)).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe("floorPlan.planeTransform", () => {
  it("builds a clamped transform string", () => {
    expect(planeTransform({ tilt: 55, rotate: 0, zoom: 1 })).toBe("rotateX(55deg) rotateZ(0deg) scale(1)");
    expect(planeTransform({ tilt: 999, rotate: 999, zoom: 99 })).toBe(
      "rotateX(75deg) rotateZ(180deg) scale(2.5)",
    );
  });
});

describe("floorPlan.markerCounterTransform", () => {
  it("negates the plane's rotations to keep pins upright", () => {
    expect(markerCounterTransform({ tilt: 55, rotate: 30, zoom: 1 })).toBe("rotateZ(-30deg) rotateX(-55deg)");
  });
});

describe("floorPlan.toPercent", () => {
  it("formats clamped percentages", () => {
    expect(toPercent(0.25)).toBe("25%");
    expect(toPercent(2)).toBe("100%");
  });
});
