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
  { label: "Home",         href: "/dashboard",    icon: LayoutDashboard, code: "DSH", group: "Main" },
  { label: "My Jobs",      href: "/work-orders",  icon: ClipboardList,   code: "WO",  group: "Main" },
  { label: "Check-Ups",    href: "/inspections",  icon: ClipboardCheck,  code: "INS", group: "Main" },
  { label: "Repairs",      href: "/maintenance",  icon: Wrench,          code: "MNT", group: "Main" },
  { label: "Checklists",   href: "/checklists",   icon: ListChecks,      code: "CHK", group: "Main" },
  { label: "Equipment",    href: "/assets",       icon: Package,         code: "AST", group: "Things" },
  { label: "Places",       href: "/locations",    icon: Building,        code: "LOC", group: "Things" },
  { label: "Suppliers",    href: "/vendors",      icon: Building2,       code: "VND", group: "Things" },
  { label: "Calendar",     href: "/calendar",     icon: Calendar,        code: "CAL", group: "Plan" },
  { label: "Reports",      href: "/reports",      icon: BarChart3,       code: "RPT", group: "Plan" },
  { label: "Team",         href: "/team",         icon: Users,           code: "TM",  group: "People" },
  { label: "Messages",     href: "/chat",         icon: MessageSquare,   code: "MSG", group: "People" },
  { label: "Settings",     href: "/settings",     icon: Settings,        code: "SET", group: "More" },
  { label: "Help",         href: "/help",         icon: HelpCircle,      code: "HLP", group: "More" },
];

export const NAV_GROUPS = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
