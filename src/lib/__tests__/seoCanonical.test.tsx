import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { CanonicalUrl } from "@/components/CanonicalUrl";
import { canonicalUrlForPath, SITE_ORIGIN } from "@/lib/seoCanonical";

function sitemapUrls(): string[] {
  const xml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
  const document = new DOMParser().parseFromString(xml, "application/xml");

  expect(document.querySelector("parsererror")).toBeNull();

  return Array.from(document.querySelectorAll("loc"), (element) =>
    element.textContent?.trim(),
  ).filter((url): url is string => Boolean(url));
}

describe("canonicalUrlForPath", () => {
  it("returns a matching self-canonical for every sitemap URL", () => {
    const urls = sitemapUrls();

    expect(urls.length).toBeGreaterThanOrEqual(48);
    expect(new Set(urls).size).toBe(urls.length);

    for (const url of urls) {
      const parsedUrl = new URL(url);

      expect(parsedUrl.origin).toBe(SITE_ORIGIN);
      expect(canonicalUrlForPath(parsedUrl.pathname), url).toBe(url);
    }
  });

  it("normalizes trailing slashes without changing the canonical URL", () => {
    expect(canonicalUrlForPath("/pricing/")).toBe(`${SITE_ORIGIN}/pricing`);
    expect(canonicalUrlForPath("/learn/cmms/")).toBe(`${SITE_ORIGIN}/learn/cmms`);
  });

  it("does not canonicalize private, utility, or malformed paths", () => {
    expect(canonicalUrlForPath("/dashboard")).toBeNull();
    expect(canonicalUrlForPath("/forgot-password")).toBeNull();
    expect(canonicalUrlForPath("/learn/one/two")).toBeNull();
    expect(canonicalUrlForPath("/pricing?plan=pro")).toBeNull();
  });
});

describe("CanonicalUrl", () => {
  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("renders exactly one matching canonical for every sitemap URL", async () => {
    for (const url of sitemapUrls()) {
      const { pathname } = new URL(url);
      document.head.innerHTML =
        '<link data-rh="true" rel="canonical" href="https://maintenease.com/" />';

      const view = render(
        <HelmetProvider>
          <MemoryRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            initialEntries={[pathname]}
          >
            <CanonicalUrl />
          </MemoryRouter>
        </HelmetProvider>,
      );

      await waitFor(() => {
        const canonicals = document.head.querySelectorAll('link[rel="canonical"]');
        expect(canonicals, url).toHaveLength(1);
        expect(canonicals[0]?.getAttribute("href"), url).toBe(url);
      });

      view.unmount();
      document.head.innerHTML = "";
    }
  });

  it("removes the static homepage fallback from non-indexed routes", async () => {
    document.head.innerHTML =
      '<link data-rh="true" rel="canonical" href="https://maintenease.com/" />';

    render(
      <HelmetProvider>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          initialEntries={["/dashboard"]}
        >
          <CanonicalUrl />
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);
    });
  });
});
