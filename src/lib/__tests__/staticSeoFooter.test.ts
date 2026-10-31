import { describe, expect, it } from "vitest";
import {
  STATIC_SEO_FOOTER_HTML,
  STATIC_SEO_FOOTER_ID,
  injectStaticSeoFooter,
} from "../staticSeoFooter";

describe("staticSeoFooter", () => {
  it("exposes a followed Decent4 backlink without rel=nofollow", () => {
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="https://decent4.com/"');
    expect(STATIC_SEO_FOOTER_HTML).toContain("Built by Decent4");
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="/privacy"');
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="/terms"');
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="/refund-policy"');
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="/sms-opt-in"');
    expect(STATIC_SEO_FOOTER_HTML).toContain('href="/sitemap"');
    expect(STATIC_SEO_FOOTER_HTML).not.toMatch(/rel=["'][^"']*nofollow/i);
  });

  it("injects the footer after #root once", () => {
    const html = '<div id="root"><main></main></div>\n    <script src="/app.js"></script>';
    const out = injectStaticSeoFooter(html);
    expect(out).toContain(`id="${STATIC_SEO_FOOTER_ID}"`);
    expect(out.match(new RegExp(STATIC_SEO_FOOTER_ID, "g"))).toHaveLength(1);
    expect(injectStaticSeoFooter(out)).toBe(out);
  });
});
