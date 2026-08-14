import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { canonicalUrlForPath } from "@/lib/seoCanonical";
import { classifySeoPath } from "@/lib/seoRouting";

export function CanonicalUrl() {
  const { pathname } = useLocation();
  const canonicalUrl = canonicalUrlForPath(pathname);
  const indexable = classifySeoPath(pathname) === "indexable";

  return (
    <Helmet>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta
        name="robots"
        content={indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow"}
      />
    </Helmet>
  );
}
