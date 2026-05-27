import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { trackPageView, setUserData } from "@/lib/gtag";

/**
 * Mounts under BrowserRouter + AuthProvider.
 * Fires a Google Ads page_view on every route change and syncs user identity
 * so Google can build remarketing audiences and tie conversions back to users.
 */
export function GtagRouterTracker() {
  const location = useLocation();
  const { user } = useAuth();

  // Pageviews
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Identity
  useEffect(() => {
    if (user?.id) {
      setUserData({ userId: user.id, email: user.email ?? null });
    } else {
      setUserData(null);
    }
  }, [user?.id, user?.email]);

  return null;
}
