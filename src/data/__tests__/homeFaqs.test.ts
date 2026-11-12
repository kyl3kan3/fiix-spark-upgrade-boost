import { describe, expect, it } from "vitest";
import { HOME_FAQS, buildHomeFaqPageJsonLd } from "../homeFaqs";

describe("homepage FAQ / JSON-LD", () => {
  it("exposes the required pricing and product questions verbatim", () => {
    expect(HOME_FAQS).toHaveLength(2);
    expect(HOME_FAQS[0]).toEqual({
      q: "How much does MaintenEase cost?",
      a: "Plans start at $49 per month. Starter is $49/mo with 2 seats. Pro is $129/mo with 4 seats. Business is $299/mo with 4 seats. Extra seats are $15/mo each.",
    });
    expect(HOME_FAQS[1]).toEqual({
      q: "What does MaintenEase do?",
      a: "MaintenEase tracks work orders, assets, and inspections in one place. Eligible plans add predictive maintenance so you can act earlier.",
    });
  });

  it("builds FAQPage JSON-LD that matches visible FAQ copy exactly", () => {
    const schema = buildHomeFaqPageJsonLd();
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(HOME_FAQS.length);
    for (let i = 0; i < HOME_FAQS.length; i += 1) {
      const entity = schema.mainEntity[i];
      expect(entity.name).toBe(HOME_FAQS[i].q);
      expect(entity.acceptedAnswer.text).toBe(HOME_FAQS[i].a);
    }
  });
});
