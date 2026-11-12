/** Visible homepage FAQ copy and FAQPage JSON-LD (https://maintenease.com/). */
export const HOME_FAQS = [
  {
    q: "How much does MaintenEase cost?",
    a: "Plans start at $49 per month. Starter is $49/mo with 2 seats. Pro is $129/mo with 4 seats. Business is $299/mo with 4 seats. Extra seats are $15/mo each.",
  },
  {
    q: "What does MaintenEase do?",
    a: "MaintenEase tracks work orders, assets, and inspections in one place. Eligible plans add predictive maintenance so you can act earlier.",
  },
] as const;

export function buildHomeFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
