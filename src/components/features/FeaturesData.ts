
import { ReactNode } from "react";
import { BarChart2, Calendar, ClipboardCheck, Clock, Settings, Users } from "lucide-react";

// Feature categories
export const categories = [
  { value: "all", label: "All Features" },
  { value: "core", label: "Core Features" },
  { value: "advanced", label: "Advanced" },
  { value: "reporting", label: "Reporting" },
];

// View options
export const viewOptions = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
];

// Features data with categories
export interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
  category: string;
  benefits: string[];
  demoEnabled: boolean;
}

export const featureItems: FeatureItem[] = [
  {
    title: "Work Order Management",
    description: "Create, assign, and track work orders with ease to ensure nothing falls through the cracks.",
    icon: <ClipboardCheck className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Streamlined workflows", "Real-time updates", "Mobile accessibility"],
    demoEnabled: true,
  },
  {
    title: "Preventive Maintenance",
    description: "Schedule recurring maintenance tasks to prevent costly breakdowns and extend asset life.",
    icon: <Calendar className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Reduce unexpected downtime", "Extend equipment life", "Optimize maintenance schedules"],
    demoEnabled: true,
  },
  {
    title: "Asset Management",
    description: "Keep detailed records of all your equipment, including maintenance history and documentation.",
    icon: <Settings className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "core",
    benefits: ["Centralized asset database", "Complete maintenance history", "Document storage"],
    demoEnabled: true,
  },
  {
    title: "Team Collaboration",
    description: "Improve communication between maintenance teams with real-time updates and notifications.",
    icon: <Users className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "advanced",
    benefits: ["Streamlined communication", "Task assignment", "Mobile notifications"],
    demoEnabled: false,
  },
  {
    title: "Performance Analytics",
    description: "Gain insights into your maintenance operations with detailed reports and KPI tracking.",
    icon: <BarChart2 className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "reporting",
    benefits: ["Customizable dashboards", "Exportable reports", "Key metric tracking"],
    demoEnabled: false,
  },
  {
    title: "Downtime Tracking",
    description: "Monitor equipment downtime and identify opportunities to improve efficiency.",
    icon: <Clock className="h-12 w-12 p-2 bg-fiix-100 text-fiix-600 rounded-lg" />,
    category: "reporting",
    benefits: ["Minimize production losses", "Identify problem areas", "Calculate true maintenance costs"],
    demoEnabled: false,
  },
];
