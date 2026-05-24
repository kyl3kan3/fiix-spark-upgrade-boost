import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { setSentryRoute, setSentryUser } from "@/lib/sentry";

/**
 * Keeps Sentry's scope in sync with the running app:
 *  - tags every event with the current route path
 *  - attaches the authenticated user id/email when available
 *
 * Renders nothing. Mount once inside the router + auth providers.
 */
export const SentryContextSync = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setSentryRoute(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    setSentryUser(user ? { id: user.id, email: user.email } : null);
  }, [user]);

  return null;
};