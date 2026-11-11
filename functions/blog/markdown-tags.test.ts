import { afterEach, expect, it, vi } from 'vitest';
import { onRequestGet } from './[slug].md';

afterEach(() => vi.unstubAllGlobals());
it.each(['maintenance, safety', ['maintenance', 'safety'], null])('renders schema text tags and legacy arrays without errors: %s', async (tags) => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ slug: 'guide', title: 'Guide', tags, content_markdown: 'Body' }]))));
  const response = await onRequestGet({ params: { slug: 'guide' } });
  expect(response.status).toBe(200);
  const text = await response.text();
  expect(text).toContain('# Guide');
  if (tags) expect(text).toContain('Tags: maintenance, safety');
  else expect(text).not.toContain('Tags:');
});
