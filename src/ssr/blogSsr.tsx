import { createContext, useContext, type ReactNode } from "react";

/** Build-time blog rows passed from prerender into SSR (same shape as scripts/prerender fetch). */
export type BlogSsrPostListItem = {
  id: number;
  title: string;
  slug: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  meta_description: string | null;
  published_at: string | null;
  reading_time: number | null;
};

export type BlogSsrPostDetail = {
  id: number;
  title: string;
  slug: string;
  content_html: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  infographic_url: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  faq_schema: { question: string; answer: string }[] | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string | null;
};

export type BlogSsrPayload = {
  indexPosts?: BlogSsrPostListItem[];
  post?: BlogSsrPostDetail;
};

const BlogSsrContext = createContext<BlogSsrPayload | null>(null);

export function BlogSsrProvider({
  value,
  children,
}: {
  value: BlogSsrPayload | null;
  children: ReactNode;
}) {
  return <BlogSsrContext.Provider value={value}>{children}</BlogSsrContext.Provider>;
}

export function useBlogSsrPayload(): BlogSsrPayload | null {
  return useContext(BlogSsrContext);
}