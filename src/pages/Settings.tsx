
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <SettingsTab />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
