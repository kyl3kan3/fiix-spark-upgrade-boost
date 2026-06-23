import {
 LayoutDashboard, ClipboardList, ClipboardCheck, Bell,
 Package, Building, Calendar, Users, Building2, Settings, BarChart3, CreditCard, Inbox,
 Zap, KeyRound, ShieldCheck, BrainCircuit, HeartPulse, Wallet, FileStack, Gauge, Bot, Compass, Upload, type LucideIcon,
} from "lucide-react";
import type { TIER_FEATURES } from "@/hooks/useSubscription";

export type FeatureKey = keyof typeof TIER_FEATURES["starter"];

export interface NavItem {
 label: string;
 href: string;
 icon: LucideIcon;
 code: string; // mono code shown in tooltips / palette
 group: string;
 feature?: FeatureKey; // if set, item is hidden unless plan includes feature
}

export const NAV_ITEMS: NavItem[] = [
 { label: "Home", href: "/dashboard", icon: LayoutDashboard, code: "DSH", group: "Main" },
 { label: "Request Inbox", href: "/requests", icon: Inbox, code: "REQ", group: "Main" },
 { label: "Due Today", href: "/checklists/due", icon: Bell, code: "DUE", group: "Main" },
 { label: "My Jobs", href: "/work-orders", icon: ClipboardList, code: "WO", group: "Main" },
 { label: "Check-Ups", href: "/inspections", icon: ClipboardCheck, code: "INS", group: "Main" },
 { label: "Calendar", href: "/calendar", icon: Calendar, code: "CAL", group: "Main" },
 { label: "Equipment", href: "/assets", icon: Package, code: "AST", group: "Things" },
 { label: "Places", href: "/locations", icon: Building, code: "LOC", group: "Things" },
 { label: "Team", href: "/team", icon: Users, code: "TM", group: "People" },
 { label: "Vendors", href: "/vendors", icon: Building2, code: "VEN", group: "People" },
 { label: "Predictive", href: "/predictive-maintenance", icon: BrainCircuit, code: "PDM", group: "More", feature: "predictive_maintenance" },
 { label: "Self-Healing", href: "/self-healing", icon: HeartPulse, code: "HEAL", group: "More" },
 { label: "Costs", href: "/cost-tracking", icon: Wallet, code: "COST", group: "More" },
 { label: "Documents", href: "/onboarding/documents", icon: FileStack, code: "DOC", group: "More" },
 { label: "Power Usage", href: "/power-usage", icon: Gauge, code: "PWR", group: "More" },
 { label: "Assistant", href: "/assistant", icon: Bot, code: "AI", group: "More" },
 { label: "Guided Setup", href: "/guided-setup", icon: Compass, code: "SETUP", group: "More" },
 { label: "Building Viewer", href: "/building-viewer", icon: Building2, code: "BLD", group: "More" },
 { label: "Import Data", href: "/import", icon: Upload, code: "IMP", group: "More" },
 { label: "Analytics", href: "/reports", icon: BarChart3, code: "RPT", group: "More", feature: "analytics" },
 { label: "Automations", href: "/automations", icon: Zap, code: "AUT", group: "More", feature: "automations" },
 { label: "API Keys", href: "/api-keys", icon: KeyRound, code: "API", group: "More", feature: "api" },
 { label: "SSO", href: "/sso", icon: ShieldCheck, code: "SSO", group: "More", feature: "sso" },
 { label: "Billing", href: "/billing", icon: CreditCard, code: "BIL", group: "More" },
 { label: "Settings", href: "/settings", icon: Settings, code: "SET", group: "More" },
];

export const NAV_GROUPS = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
