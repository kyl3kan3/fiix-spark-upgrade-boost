import { describe, expect, it } from "vitest";
import { blogBodyHasFaqHeading, getSupplementalBlogFaqs } from "@/lib/blogContent";

const faqs = [
  { question: "What is a work order?", answer: "A tracked maintenance task." },
  { question: "How should it be closed?", answer: "Record the completed work." },
];

describe("blog FAQ content", () => {
  it("does not render FAQ rows already present in the article HTML", () => {
    const html = `
      <h2>Frequently Asked Questions</h2>
      <h3>What is a work order?</h3><p>A tracked maintenance task.</p>
      <h3>How should it be closed?</h3><p>Record the completed work.</p>
    `;

    expect(blogBodyHasFaqHeading(html)).toBe(true);
    expect(getSupplementalBlogFaqs(html, faqs)).toEqual([]);
  });

  it("returns only FAQ rows missing from the article HTML", () => {
    const html = "<h2>Frequently Asked Questions</h2><h3>What is a work order?</h3>";

    expect(getSupplementalBlogFaqs(html, faqs)).toEqual([faqs[1]]);
  });

  it("returns every FAQ when the article has no FAQ content", () => {
    expect(blogBodyHasFaqHeading("<p>Article body</p>")).toBe(false);
    expect(getSupplementalBlogFaqs("<p>Article body</p>", faqs)).toEqual(faqs);
  });
});
