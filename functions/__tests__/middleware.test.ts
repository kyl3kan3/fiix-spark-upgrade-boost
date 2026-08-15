import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@datafast/ai-crawl", () => ({
  trackAICrawlerRequest: vi.fn(),
}));

import { onRequest } from "../_middleware";

type MockContext = {
  request: Request;
  next: ReturnType<typeof vi.fn>;
};

function contextFor(
  path: string,
  response: Response,
  headers: Record<string, string> = {},
): MockContext {
  return {
    request: new Request(`https://maintenease.com${path}`, { headers }),
    next: vi.fn(async () => response),
  };
}

describe("crawler edge middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line no-console
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  it("serves the Markdown alternate when explicitly requested", async () => {
    const context = contextFor(
      "/features",
      new Response("# Features\n", { headers: { "Content-Type": "text/plain" } }),
      { Accept: "text/markdown" },
    );

    const response = await onRequest(context);
    const downstream = context.next.mock.calls[0]?.[0] as Request;

    expect(new URL(downstream.url).pathname).toBe("/features.md");
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Content-Location")).toBe("/features.md");
    expect(response.headers.get("Vary")).toContain("Accept");
    expect(response.headers.get("Link")).toContain('</features>; rel="canonical"');
    expect(await response.text()).toBe("# Features\n");
  });

  it("advertises Markdown on the normal HTML representation", async () => {
    const context = contextFor(
      "/features",
      new Response("<html><body>Features</body></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
      { Accept: "text/html,*/*" },
    );

    const response = await onRequest(context);

    expect(context.next).toHaveBeenCalledWith(undefined);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Vary")).toContain("Accept");
    expect(response.headers.get("Link")).toContain(
      '</features.md>; rel="alternate"; type="text/markdown"',
    );
  });

  it("does not disguise an unknown app-shell route as Markdown", async () => {
    const context = contextFor(
      "/not-a-page.md",
      new Response("<html><body>App shell</body></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );

    const response = await onRequest(context);

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("emits a privacy-preserving structured log for recognized crawlers", async () => {
    // eslint-disable-next-line no-console
    const info = vi.mocked(console.info);
    const context = contextFor(
      "/pricing",
      new Response("<html><body>Pricing</body></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
      { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    );

    await onRequest(context);

    expect(info).toHaveBeenCalledOnce();
    const event = JSON.parse(String(info.mock.calls[0]?.[0]));
    expect(event).toMatchObject({
      event: "crawler_document_request",
      crawler: "googlebot",
      path: "/pricing",
      representation: "html",
      status: 200,
    });
    expect(event).not.toHaveProperty("userAgent");
    expect(event).not.toHaveProperty("ip");
  });
});
