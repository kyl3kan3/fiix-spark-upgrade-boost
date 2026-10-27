import { NAV_ITEMS } from "@/components/shell/navConfig";
import { PROTECTED_ROUTES } from "@/router/routeManifest";

const EXTRA_TITLES: Record<string, string> = {
  "/maintenance": "Maintenance",
  "/checklists": "PM Checklists",
  "/checklists/new": "New Checklist",
  "/checklists/submissions": "Submissions",
  "/notifications": "Notifications",
  "/admin": "Admin",
  "/onboarding": "Onboarding",
  "/reports/mttr": "MTTR Report",
  "/assets/new": "Add Equipment",
};

const NAV_BY_LONGEST_HREF = [...NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);

const EXTRA_BY_LONGEST_PREFIX = Object.entries(EXTRA_TITLES).sort(
  (a, b) => b[0].length - a[0].length,
);

/** Resolve a human page title for the authenticated shell header. */
export function resolvePageTitle(pathname: string): string {
  const nav = NAV_BY_LONGEST_HREF.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (nav) return nav.label;

  for (const [prefix, title] of EXTRA_BY_LONGEST_PREFIX) {
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
