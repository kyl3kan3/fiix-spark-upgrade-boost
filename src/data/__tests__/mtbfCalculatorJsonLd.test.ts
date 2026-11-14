import { describe, expect, it } from "vitest";
import { buildMtbfCalculatorSoftwareApplicationJsonLd } from "../mtbfCalculatorJsonLd";

describe("buildMtbfCalculatorSoftwareApplicationJsonLd", () => {
  it("includes required SoftwareApplication fields", () => {
    const schema = buildMtbfCalculatorSoftwareApplicationJsonLd();
    expect(schema["@type"]).toEqual(["SoftwareApplication", "WebApplication"]);
    expect(schema.name).toBe("MTBF calculator");
    expect(schema.applicationCategory).toBe("BusinessApplication");
    expect(schema.operatingSystem).toBe("Web");
    expect(schema.url).toBe("https://maintenease.com/tools/mtbf-calculator");
    expect(schema.description).toContain("Free MTBF calculator");
    expect(schema.isAccessibleForFree).toBe(true);
    expect(schema.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });
    expect(schema.publisher).toEqual({ "@id": "https://maintenease.com/#organization" });
    expect(schema.provider).toEqual({ "@id": "https://maintenease.com/#organization" });
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });
});