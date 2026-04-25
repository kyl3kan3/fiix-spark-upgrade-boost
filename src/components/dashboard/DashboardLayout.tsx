import React from "react";
import AppShell from "@/components/shell/AppShell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout is the public layout API used by every page.
 * It now delegates to AppShell (Industrial Blueprint shell).
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return <AppShell>{children}</AppShell>;
};

export default DashboardLayout;
