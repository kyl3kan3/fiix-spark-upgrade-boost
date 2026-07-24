import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { canonicalUrlForPath } from "@/lib/seoCanonical";

export function CanonicalUrl() {
  const { pathname } = useLocation();
  const canonicalUrl = canonicalUrlForPath(pathname);

  return (
    <Helmet>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
}
