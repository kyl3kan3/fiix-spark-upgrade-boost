
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SetAdminUser from "@/components/admin/SetAdminUser";
import BackToDashboard from "@/components/dashboard/BackToDashboard";

const ProfilePage = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        <SetAdminUser email="kyl3kan3@gmail.com" />
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">
            Profile settings content will appear here.
            This page is currently under development.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
