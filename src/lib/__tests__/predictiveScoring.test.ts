import { describe, expect, it } from "vitest";
import {
  computeAssetRisk,
  MODEL_VERSION,
  type AssetScoringInput,
} from "@/lib/predictiveScoring";

const NOW = new Date("2026-06-14T00:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();
const yearsAgo = (n: number) => new Date(NOW.getTime() - n * 365 * 86400000).toISOString();

function makeInput(overrides: Partial<AssetScoringInput> = {}): AssetScoringInput {
  return {
    assetId: "asset-1",
    failureEvents: [],
    workOrders: [],
    healthMetrics: [],
    now: NOW,
    ...overrides,
  };
}

describe("computeAssetRisk", () => {
  it("scores a brand-new, healthy asset as low risk", () => {
    const result = computeAssetRisk(
      makeInput({
        purchaseDate: yearsAgo(1),
        expectedServiceLifeYears: 10,
        healthMetrics: [{ metric_type: "manual_condition", value: 5, recorded_at: daysAgo(2) }],
      }),
    );

    expect(result.riskLevel).toBe("low");
    expect(result.riskScore).toBeLessThan(30);
    expect(result.failureProbability).toBeLessThan(0.3);
    expect(result.modelVersion).toBe(MODEL_VERSION);
    expect(result.recommendedAction.toLowerCase()).toContain("no action");
  });

  it("scores an old asset with recent failures and overdue work as high/critical risk", () => {
    const result = computeAssetRisk(
      makeInput({
        purchaseDate: yearsAgo(12), // past expected life
        expectedServiceLifeYears: 10,
        failureEvents: [
          { failed_at: daysAgo(400) },
          { failed_at: daysAgo(120) },
          { failed_at: daysAgo(10) }, // very recent
        ],
        workOrders: [
          { status: "pending", priority: "urgent", due_date: daysAgo(5) }, // open + overdue + high
          { status: "in_progress", priority: "high", due_date: daysAgo(2) },
        ],
        healthMetrics: [
          { metric_type: "vibration", value: 3, recorded_at: daysAgo(60) },
          { metric_type: "vibration", value: 9, recorded_at: daysAgo(2) }, // rising
        ],
      }),
    );

    expect(["high", "critical"]).toContain(result.riskLevel);
    expect(result.riskScore).toBeGreaterThan(60);
    expect(result.remainingUsefulLifeDays).not.toBeNull();
    expect(result.remainingUsefulLifeDays as number).toBeGreaterThanOrEqual(0);
    expect(result.predictedFailureDate).not.toBeNull();
  });

  it("always returns the four weighted factors that sum their weights to 1", () => {
    const result = computeAssetRisk(makeInput());
    const totalWeight = result.contributingFactors.reduce((s, f) => s + f.weight, 0);
    expect(result.contributingFactors).toHaveLength(4);
    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it("handles missing data gracefully (no purchase date, no history)", () => {
    const result = computeAssetRisk(makeInput());
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    // Unknown age + no condition data keep it out of the high/critical band.
    expect(["low", "medium"]).toContain(result.riskLevel);
  });
});
