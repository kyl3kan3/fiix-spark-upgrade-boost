import { describe, expect, it } from "vitest";
import { buildWorkOrderReportData } from "../reportService";

const NOW = new Date("2026-06-15T12:00:00.000Z");

const row = (overrides: Partial<{
 created_at: string;
 status: string;
 priority: string;
 asset: { name: string } | null;
}> = {}) => ({
 created_at: "2026-06-01T10:00:00.000Z",
 status: "pending",
 priority: "medium",
 asset: null,
 ...overrides,
});

describe("buildWorkOrderReportData", () => {
 it("produces six month buckets ending at the current month", () => {
 const { monthly, trends } = buildWorkOrderReportData([], NOW);

 expect(monthly.map((m) => m.name)).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
 expect(trends).toHaveLength(6);
 expect(monthly.every((m) => m.workOrders === 0)).toBe(true);
 });

 it("counts work orders into the right month with status breakdown", () => {
 const { monthly } = buildWorkOrderReportData(
 [
 row({ created_at: "2026-06-02T00:00:00.000Z", status: "completed" }),
 row({ created_at: "2026-06-20T00:00:00.000Z", status: "in_progress" }),
 row({ created_at: "2026-04-10T00:00:00.000Z" }),
 ],
 NOW,
 );

 const june = monthly[5];
 expect(june).toMatchObject({ name: "Jun", workOrders: 2, completed: 1, inProgress: 1 });
 expect(monthly[3]).toMatchObject({ name: "Apr", workOrders: 1, completed: 0 });
 });

 it("ignores rows outside the six-month window", () => {
 const { monthly } = buildWorkOrderReportData(
 [row({ created_at: "2025-11-01T00:00:00.000Z" })],
 NOW,
 );
 expect(monthly.every((m) => m.workOrders === 0)).toBe(true);
 });

 it("classifies priorities into preventive vs corrective trends", () => {
 const { trends } = buildWorkOrderReportData(
 [
 row({ priority: "low" }),
 row({ priority: "medium" }),
 row({ priority: "high" }),
 row({ priority: "urgent" }),
 ],
 NOW,
 );
 expect(trends[5]).toMatchObject({ preventive: 2, corrective: 2 });
 });

 it("aggregates the asset pie with top assets plus Other", () => {
 const rows = [
 ...Array.from({ length: 4 }, () => row({ asset: { name: "Boiler" } })),
 ...Array.from({ length: 3 }, () => row({ asset: { name: "Chiller" } })),
 ...["A", "B", "C", "D"].map((name) => row({ asset: { name } })),
 row({ asset: null }),
 ];
 const { byAsset } = buildWorkOrderReportData(rows, NOW);

 expect(byAsset[0]).toEqual({ name: "Boiler", value: 4 });
 expect(byAsset[1]).toEqual({ name: "Chiller", value: 3 });
 expect(byAsset).toHaveLength(6);
 expect(byAsset[5].name).toBe("Other");
 // 5 named slices keep 4+3+1+1+1, leaving one single-count asset and
 // the no-asset row distributed between slices and Other.
 const total = byAsset.reduce((sum, slice) => sum + slice.value, 0);
 expect(total).toBe(rows.length);
 });
});
