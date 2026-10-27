import type { NavRole } from "@/components/shell/navConfig";

/** Map profile / app_role values to nav visibility roles. */
export function toNavRole(profileRole: string | null | undefined): NavRole {
  if (!profileRole) return "viewer";
  const r = profileRole.toLowerCase();
  if (r === "administrator" || r === "admin") return "admin";
  if (r === "manager") return "manager";
  if (r === "technician") return "technician";
  if (r === "super_admin") return "super_admin";
  return "viewer";
}

export const TECHNICIAN_BLOCKED_PATHS = ["/billing", "/import"] as const;

export function isTechnicianBlockedPath(pathname: string): boolean {
  return TECHNICIAN_BLOCKED_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
