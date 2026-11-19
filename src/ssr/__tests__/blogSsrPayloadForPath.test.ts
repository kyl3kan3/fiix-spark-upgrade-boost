import { describe, expect, it } from "vitest";
import { blogSsrPayloadForPath } from "../blogSsr";

describe("blogSsrPayloadForPath", () => {
  it("keeps index payload only on /blog", () => {
    const payload = { indexPosts: [{ slug: "a" } as never] };
    expect(blogSsrPayloadForPath(payload, "/blog")).toEqual(payload);
    expect(blogSsrPayloadForPath(payload, "/blog/")).toEqual(payload);
    expect(blogSsrPayloadForPath(payload, "/pricing")).toBeNull();
  });

  it("keeps post payload only when slug matches", () => {
    const payload = { post: { slug: "hello" } as never };
    expect(blogSsrPayloadForPath(payload, "/blog/hello")).toEqual(payload);
    expect(blogSsrPayloadForPath(payload, "/blog/other")).toBeNull();
    expect(blogSsrPayloadForPath(payload, "/blog")).toBeNull();
  });
});