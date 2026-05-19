import {
  LayoutDashboard, ClipboardList, ClipboardCheck, Bell,
  Package, Building, Calendar, Users, Building2, Settings, BarChart3, CreditCard, Inbox, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  code: string; // mono code shown in tooltips / palette
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home",         href: "/dashboard",    icon: LayoutDashboard, code: "DSH", group: "Main" },
  { label: "Request Inbox", href: "/requests",    icon: Inbox,           code: "REQ", group: "Main" },
  { label: "Due Today",    href: "/checklists/due", icon: Bell,          code: "DUE", group: "Main" },
  { label: "My Jobs",      href: "/work-orders",  icon: ClipboardList,   code: "WO",  group: "Main" },
  { label: "Check-Ups",    href: "/inspections",  icon: ClipboardCheck,  code: "INS", group: "Main" },
  { label: "Calendar",     href: "/calendar",     icon: Calendar,        code: "CAL", group: "Main" },
  { label: "Equipment",    href: "/assets",       icon: Package,         code: "AST", group: "Things" },
  { label: "Places",       href: "/locations",    icon: Building,        code: "LOC", group: "Things" },
  { label: "Team",         href: "/team",         icon: Users,           code: "TM",  group: "People" },
  { label: "Vendors",      href: "/vendors",      icon: Building2,       code: "VEN", group: "People" },
  { label: "Analytics",    href: "/reports",      icon: BarChart3,       code: "RPT", group: "More" },
  { label: "Billing",      href: "/billing",      icon: CreditCard,      code: "BIL", group: "More" },
  { label: "Settings",     href: "/settings",     icon: Settings,        code: "SET", group: "More" },
];

export const NAV_GROUPS = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
