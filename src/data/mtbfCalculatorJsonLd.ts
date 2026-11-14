import { SITE_ORIGIN } from "./productCatalog";
import { getSecondPassToolPage } from "./secondPassTools";

const organizationId = `${SITE_ORIGIN}/#organization`;

/** SoftwareApplication JSON-LD for /tools/mtbf-calculator (prerendered static HTML). */
export function buildMtbfCalculatorSoftwareApplicationJsonLd() {
  const page = getSecondPassToolPage("mtbf-calculator");
  if (!page) {
    throw new Error("mtbf-calculator tool page data missing");
  }

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: page.h1,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE_ORIGIN}${page.path}`,
    description: page.metaDescription,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": organizationId },
    provider: { "@id": organizationId },
  };
}

export function jsonLdTypes(node: { "@type"?: string | string[] }): string[] {
  const raw = node["@type"];
  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function isSoftwareApplicationType(node: { "@type"?: string | string[] }): boolean {
  return jsonLdTypes(node).some((type) => type === "SoftwareApplication" || type === "WebApplication");
}