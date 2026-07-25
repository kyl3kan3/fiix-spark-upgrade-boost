import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Renders sitewide Organization + WebSite structured data so every marketing
 * page emits rich-result signals for crawlers, not just the static index.html.
 */
const ORG_LD = {
 "@context": "https://schema.org",
 "@type": "Organization",
 name: "MaintenEase",
 url: "https://maintenease.com/",
 logo: "https://maintenease.com/favicon.png",
 sameAs: ["https://twitter.com/maintenease"],
};

const WEBSITE_LD = {
 "@context": "https://schema.org",
 "@type": "WebSite",
 name: "MaintenEase",
 url: "https://maintenease.com/",
 potentialAction: {
 "@type": "SearchAction",
 target: "https://maintenease.com/learn?q={search_term_string}",
 "query-input": "required name=search_term_string",
 },
};

export default function MarketingJsonLd() {
 const { pathname } = useLocation();
 const isHome = pathname === "/";

 // On non-home routes (including client-side navigations away from "/"),
 // drop the homepage-only static blocks so no duplicate nodes remain.
 useEffect(() => {
 if (isHome) return;
 document
 .querySelectorAll('script[type="application/ld+json"][data-ld-home]')
 .forEach((el) => el.remove());
 }, [isHome]);

 // The homepage ships these two blocks statically in index.html (visible to
 // no-JS crawlers), so skip them here to avoid duplicate nodes.
 if (isHome) return null;

 return (
 <Helmet>
 <script type="application/ld+json" data-ld="organization">
 {JSON.stringify(ORG_LD)}
 </script>
 <script type="application/ld+json" data-ld="website">
 {JSON.stringify(WEBSITE_LD)}
 </script>
 </Helmet>
 );
}