
import React from "react";
import WorkOrderContent from "./WorkOrderContent";
import PreventiveMaintenanceContent from "./PreventiveMaintenanceContent";
import AssetManagementContent from "./AssetManagementContent";
import ReportsContent from "./ReportsContent";

export interface FeatureContent {
  title: string;
  description: string;
  content: React.ReactNode;
}

export type FeatureContentMap = {
  [key: string]: FeatureContent;
};

// Content for each feature demo
export const featureContentMap: FeatureContentMap = {
  "Work Order Management": {
    title: "Work Order Management",
    description: "Create, track, and manage work orders in real-time",
    content: <WorkOrderContent />
  },
  "Preventive Maintenance": {
    title: "Preventive Maintenance",
    description: "Schedule and manage recurring maintenance tasks",
    content: <PreventiveMaintenanceContent />
  },
  "Asset Management": {
    title: "Asset Management",
    description: "Track and manage all your equipment and assets",
    content: <AssetManagementContent />
  },
  "Reports": {
    title: "Reports",
    description: "Generate and view maintenance reports and analytics",
    content: <ReportsContent />
  }
};
