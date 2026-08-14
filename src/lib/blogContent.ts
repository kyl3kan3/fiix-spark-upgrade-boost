export type BlogFaq = {
  question: string;
  answer: string;
};

const normalizeVisibleText = (value: string): string =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();

/** Returns only FAQ rows that are not already visible in the article body. */
export function getSupplementalBlogFaqs(
  contentHtml: string | null | undefined,
  faqs: BlogFaq[],
): BlogFaq[] {
  const bodyText = normalizeVisibleText(contentHtml ?? "");
  if (!bodyText) return faqs;

  return faqs.filter((faq) => !bodyText.includes(normalizeVisibleText(faq.question)));
}

export function blogBodyHasFaqHeading(contentHtml: string | null | undefined): boolean {
  return normalizeVisibleText(contentHtml ?? "").includes("frequently asked questions");
}
