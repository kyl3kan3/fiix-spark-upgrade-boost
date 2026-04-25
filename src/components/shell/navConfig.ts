import {
  LayoutDashboard, ClipboardList, ClipboardCheck, Wrench, ListChecks,
  Package, Building, Calendar, BarChart3, Users, Building2, Settings,
  MessageSquare, HelpCircle, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  code: string; // mono code shown in tooltips / palette
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",    icon: LayoutDashboard, code: "DSH", group: "Overview" },
  { label: "Work Orders", href: "/work-orders",  icon: ClipboardList,   code: "WO",  group: "Operations" },
  { label: "Inspections", href: "/inspections",  icon: ClipboardCheck,  code: "INS", group: "Operations" },
  { label: "Maintenance", href: "/maintenance",  icon: Wrench,          code: "MNT", group: "Operations" },
  { label: "Checklists",  href: "/checklists",   icon: ListChecks,      code: "CHK", group: "Operations" },
  { label: "Assets",      href: "/assets",       icon: Package,         code: "AST", group: "Resources" },
  { label: "Locations",   href: "/locations",    icon: Building,        code: "LOC", group: "Resources" },
  { label: "Vendors",     href: "/vendors",      icon: Building2,       code: "VND", group: "Resources" },
  { label: "Calendar",    href: "/calendar",     icon: Calendar,        code: "CAL", group: "Planning" },
  { label: "Reports",     href: "/reports",      icon: BarChart3,       code: "RPT", group: "Planning" },
  { label: "Team",        href: "/team",         icon: Users,           code: "TM",  group: "People" },
  { label: "Chat",        href: "/chat",         icon: MessageSquare,   code: "MSG", group: "People" },
  { label: "Settings",    href: "/settings",     icon: Settings,        code: "SET", group: "System" },
  { label: "Help",        href: "/help",         icon: HelpCircle,      code: "HLP", group: "System" },
];

export const NAV_GROUPS = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
