
import React from "react";
import WorkOrderContent from "./WorkOrderContent";
import PreventiveMaintenanceContent from "./PreventiveMaintenanceContent";
import AssetManagementContent from "./AssetManagementContent";
import ReportsContent from "./ReportsContent";
import TeamCollaborationContent from "./TeamCollaborationContent";
import PerformanceAnalyticsContent from "./PerformanceAnalyticsContent";
import DowntimeTrackingContent from "./DowntimeTrackingContent";

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
  "Team Collaboration": {
    title: "Team Collaboration",
    description: "Improve communication and coordination between team members",
    content: <TeamCollaborationContent />
  },
  "Performance Analytics": {
    title: "Performance Analytics",
    description: "Gain insights into your maintenance operations with detailed analytics",
    content: <PerformanceAnalyticsContent />
  },
  "Downtime Tracking": {
    title: "Downtime Tracking",
    description: "Monitor equipment downtime and identify improvement opportunities",
    content: <DowntimeTrackingContent />
  },
  "Reports": {
    title: "Reports",
    description: "Generate and view maintenance reports and analytics",
    content: <ReportsContent />
  }
};
