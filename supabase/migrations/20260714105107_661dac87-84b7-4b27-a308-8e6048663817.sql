CREATE TABLE IF NOT EXISTS public.blog_posts (
  id integer PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content_html text,
  content_markdown text,
  hero_image_url text,
  hero_image_alt text,
  infographic_url text,
  meta_description text,
  meta_keywords text,
  tags text,
  faq_schema jsonb,
  language text DEFAULT 'en',
  reading_time integer,
  published_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  received_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='blog_posts' AND policyname='Blog posts are publicly readable') THEN
    CREATE POLICY "Blog posts are publicly readable"
      ON public.blog_posts FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='blog_posts' AND policyname='Service role manages blog posts') THEN
    CREATE POLICY "Service role manages blog posts"
      ON public.blog_posts FOR ALL
      TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC);
