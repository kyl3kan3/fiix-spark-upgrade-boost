import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
 BRAND_JSON_LD,
 ORGANIZATION_JSON_LD,
 WEBSITE_JSON_LD,
} from "@/data/productCatalog";

/**
 * Renders sitewide Organization + WebSite structured data so every marketing
 * page emits rich-result signals for crawlers, not just the static index.html.
 */
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

 return (
 <Helmet>
 <script type="application/ld+json" data-ld="organization" data-rh="true">
 {JSON.stringify(ORGANIZATION_JSON_LD)}
 </script>
 <script type="application/ld+json" data-ld="website" data-rh="true">
 {JSON.stringify(WEBSITE_JSON_LD)}
 </script>
 <script type="application/ld+json" data-ld="brand" data-rh="true">
 {JSON.stringify(BRAND_JSON_LD)}
 </script>
 </Helmet>
 );
}
