import { cleanup, render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Index from "../Index";
import { buildHomeFaqPageJsonLd } from "@/data/homeFaqs";
import { jsonLdScriptTag } from "@/lib/htmlSafeJson";

const HOME_STATIC_JSON_LD = `
<script type="application/ld+json" data-ld-home="organization">
{"@context":"https://schema.org","@type":"Organization","name":"MaintenEase","url":"https://maintenease.com/"}
</script>
<script type="application/ld+json" data-ld-home="website">
{"@context":"https://schema.org","@type":"WebSite","name":"MaintenEase","url":"https://maintenease.com/"}
</script>`;

function faqPageScriptCount(): number {
  const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
  let count = 0;
  scripts.forEach((node) => {
    try {
      const parsed = JSON.parse(node.textContent ?? "") as { "@type"?: string };
      if (parsed["@type"] === "FAQPage") count += 1;
    } catch {
      // ignore
    }
  });
  return count;
}

async function flushHelmet() {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((r) => setTimeout(r, 10));
  }
}

describe("homepage FAQPage JSON-LD", () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<link data-rh="true" rel="canonical" href="https://maintenease.com/" />' +
      HOME_STATIC_JSON_LD +
      jsonLdScriptTag(buildHomeFaqPageJsonLd(), ' data-rh="true"');
  });

  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("leaves exactly one FAQPage block in the head after the client hydrates", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    await flushHelmet();
    expect(faqPageScriptCount()).toBe(1);
  });
});
