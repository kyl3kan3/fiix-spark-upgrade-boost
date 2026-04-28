import {
  LayoutDashboard, ClipboardList, ClipboardCheck,
  Package, Building, Calendar, Users, Settings, type LucideIcon,
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
  { label: "My Jobs",      href: "/work-orders",  icon: ClipboardList,   code: "WO",  group: "Main" },
  { label: "Check-Ups",    href: "/inspections",  icon: ClipboardCheck,  code: "INS", group: "Main" },
  { label: "Calendar",     href: "/calendar",     icon: Calendar,        code: "CAL", group: "Main" },
  { label: "Equipment",    href: "/assets",       icon: Package,         code: "AST", group: "Things" },
  { label: "Places",       href: "/locations",    icon: Building,        code: "LOC", group: "Things" },
  { label: "Team",         href: "/team",         icon: Users,           code: "TM",  group: "People" },
  { label: "Settings",     href: "/settings",     icon: Settings,        code: "SET", group: "More" },
];

export const NAV_GROUPS = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
