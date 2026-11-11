// Reject rather than rewrite: normalization can alias an existing article.
export function isSafeBlogSlug(value: unknown): value is string {
  // /blog/index.html is also the landing page's directory-index output.
  return typeof value === "string" && value !== "index"
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
