
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SetAdminUser from "@/components/admin/SetAdminUser";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const ProfilePage = () => {
  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
          <AlertDescription className="text-blue-700">
            Administrator access lets you manage all users and system settings
          </AlertDescription>
        </Alert>
        
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
