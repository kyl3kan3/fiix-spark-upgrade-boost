import { describe, expect, it } from "vitest";
import { jsonLdScriptTag, stringifyJsonLdForHtml } from "../htmlSafeJson";

describe("stringifyJsonLdForHtml", () => {
  it("escapes characters that can break out of a script element", () => {
    const payload = {
      text: `before</script><script>alert(1)</script>after & more`,
      lineSep: "a\u2028b",
      paraSep: "c\u2029d",
    };
    const serialized = stringifyJsonLdForHtml(payload);
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u003cscript\\u003e");
    expect(serialized).toContain("\\u0026");
    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("does not allow a FAQ answer to close the script tag in prerender output", () => {
    const xssAnswer = '</script><script>alert(1)</script>';
    const block = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Test",
          acceptedAnswer: { "@type": "Answer", text: xssAnswer },
        },
      ],
    };
    const tag = jsonLdScriptTag(block);
    expect(tag).not.toMatch(/<\/script>\s*<script>alert/);
    const inner = tag.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(inner).mainEntity[0].acceptedAnswer.text).toBe(xssAnswer);
  });
});
