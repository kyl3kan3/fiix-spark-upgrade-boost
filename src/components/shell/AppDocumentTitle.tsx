import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { resolvePageTitle } from "@/lib/pageTitle";

/** Sets the browser tab title for authenticated app routes (SPA shell). */
export function AppDocumentTitle() {
  const { pathname } = useLocation();
  const title = resolvePageTitle(pathname);
  return (
    <Helmet>
      <title>{title} | MaintenEase</title>
    </Helmet>
  );
}
