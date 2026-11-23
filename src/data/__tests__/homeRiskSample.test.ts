import { describe, expect, it } from "vitest";
import {
  HOME_RISK_SAMPLE_INPUT,
  buildHomeRiskSampleWorkflow,
  getHomeRiskSampleResult,
} from "@/data/homeRiskSample";
import { computeAssetRisk } from "@/lib/predictiveScoring";

describe("homepage risk sample workflow", () => {
  it("matches computeAssetRisk output for the published sample inputs", () => {
    const result = computeAssetRisk(HOME_RISK_SAMPLE_INPUT);
    const workflow = buildHomeRiskSampleWorkflow();

    const dominant = [...result.contributingFactors].sort(
      (a, b) => b.score * b.weight - a.score * a.weight,
    )[0];

    expect(getHomeRiskSampleResult()).toEqual(result);
    expect(workflow[2].detail).toBe(
      `${result.riskScore} — level ${result.riskLevel} — top driver: ${dominant.label.toLowerCase()}`,
    );
    expect(workflow[3].detail).toBe(result.recommendedAction);
    expect(result.riskLevel).toBe("critical");
    expect(result.recommendedAction).toBe(
      "Immediate inspection required — schedule emergency maintenance now. Top driver: failure history.",
    );
  });
});