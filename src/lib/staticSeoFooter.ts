/** Plain HTML footer for no-JS crawlers; injected at build time and removed on client mount. */
export const STATIC_SEO_FOOTER_ID = "static-seo-footer";

export const STATIC_SEO_FOOTER_HTML = `<footer id="${STATIC_SEO_FOOTER_ID}" data-prerender="static-footer" style="max-width:72rem;margin:0 auto;padding:1rem;text-align:center;font:14px/1.5 system-ui,sans-serif;color:#64748b"><a href="https://decent4.com/">Built by Decent4</a></footer>`;

export function injectStaticSeoFooter(html: string): string {
  if (html.includes(`id="${STATIC_SEO_FOOTER_ID}"`)) return html;
  return html.replace(
    /(<div id="root">[\s\S]*?<\/div>)(\s*<script)/,
    `$1\n    ${STATIC_SEO_FOOTER_HTML}$2`,
  );
}
