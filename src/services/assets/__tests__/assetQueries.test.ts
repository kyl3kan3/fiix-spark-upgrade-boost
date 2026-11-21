import { describe, expect, it } from "vitest";
import { aggregateAssetCountsByLocation } from "../assetQueries";

describe("aggregateAssetCountsByLocation", () => {
 it("returns empty array when no assets have a location", () => {
 expect(aggregateAssetCountsByLocation([])).toEqual([]);
 expect(
 aggregateAssetCountsByLocation([
 { location_id: null },
 { location_id: null },
 ]),
 ).toEqual([]);
 });

 it("counts assets per location and ignores null location_id", () => {
 const result = aggregateAssetCountsByLocation([
 { location_id: "loc-a" },
 { location_id: "loc-a" },
 { location_id: "loc-b" },
 { location_id: null },
 ]);

 expect(result).toHaveLength(2);
 expect(result).toEqual(
 expect.arrayContaining([
 { locationId: "loc-a", count: 2 },
 { locationId: "loc-b", count: 1 },
 ]),
 );
 });
});
