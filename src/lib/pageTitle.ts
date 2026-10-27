import { NAV_ITEMS } from "@/components/shell/navConfig";
import { PROTECTED_ROUTES } from "@/router/routeManifest";

const EXTRA_TITLES: Record<string, string> = {
  "/maintenance": "Maintenance",
  "/checklists": "PM Checklists",
  "/notifications": "Notifications",
  "/admin": "Admin",
  "/onboarding": "Onboarding",
};

/** Resolve a human page title for the authenticated shell header. */
export function resolvePageTitle(pathname: string): string {
  const nav = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (nav) return nav.label;

  for (const [prefix, title] of Object.entries(EXTRA_TITLES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title;
  }

  const route = [...PROTECTED_ROUTES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`));
  if (route) {
    const segment = route.path.split("/").filter(Boolean).pop();
    if (segment) {
      return segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }

  return "Dashboard";
}
