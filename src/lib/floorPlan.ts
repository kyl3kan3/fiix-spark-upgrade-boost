/**
 * Pure helpers for the CSS-3D floor-plan viewer: coordinate math and the CSS
 * transform that tilts the plan into a perspective "3D" view. No React / DOM
 * imports beyond a minimal rect shape, so it's unit-testable.
 */

export interface ViewAngle {
  /** X-axis tilt in degrees (0 = flat-on / top-down, ~60 = steep perspective). */
  tilt: number;
  /** Z-axis rotation in degrees. */
  rotate: number;
  /** Uniform scale. */
  zoom: number;
}

export const DEFAULT_VIEW: ViewAngle = { tilt: 55, rotate: 0, zoom: 1 };

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function clampAngle(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Relative (0..1) position of a pointer within an element's bounding rect. */
export function relativeFromPointer(rect: Rect, clientX: number, clientY: number): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 };
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}

/** CSS transform for the floor-plane element (applied with a perspective ancestor). */
export function planeTransform({ tilt, rotate, zoom }: ViewAngle): string {
  const t = clampAngle(tilt, 0, 75);
  const r = clampAngle(rotate, -180, 180);
  const z = clampAngle(zoom, 0.4, 2.5);
  return `rotateX(${t}deg) rotateZ(${r}deg) scale(${z})`;
}

/**
 * Counter-transform for a marker so its pin stays upright (billboarded) while the
 * plane is tilted — undo the plane's rotateX/rotateZ at the marker's origin.
 */
export function markerCounterTransform({ tilt, rotate }: ViewAngle): string {
  const t = clampAngle(tilt, 0, 75);
  const r = clampAngle(rotate, -180, 180);
  return `rotateZ(${-r}deg) rotateX(${-t}deg)`;
}

/** Convert a relative coord to a CSS percentage string for absolute positioning. */
export function toPercent(value: number): string {
  return `${clamp01(value) * 100}%`;
}
