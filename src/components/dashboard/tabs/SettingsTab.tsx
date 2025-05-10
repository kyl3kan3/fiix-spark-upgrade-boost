
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your preferences and account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 py-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          <div className="grid gap-4">
            {[
              { id: 1, title: "Email Notifications", description: "Receive email notifications for work orders", enabled: true },
              { id: 2, title: "Push Notifications", description: "Receive push notifications on your browser", enabled: false },
              { id: 3, title: "SMS Notifications", description: "Receive text message alerts for critical issues", enabled: false },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{pref.title}</p>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
                <div className={`h-6 w-11 rounded-full p-1 transition ${pref.enabled ? "bg-maintenease-600" : "bg-gray-200"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition transform ${pref.enabled ? "translate-x-5" : ""}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Display Settings</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Use dark theme for the application</p>
              </div>
              <div className="h-6 w-11 rounded-full p-1 transition bg-gray-200">
                <div className="h-4 w-4 rounded-full bg-white transition transform"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">Dashboard Layout</p>
                <p className="text-sm text-gray-500">Choose your preferred dashboard layout</p>
              </div>
              <select className="border rounded-md px-2 py-1 text-sm">
                <option>Default</option>
                <option>Compact</option>
                <option>Detailed</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="bg-maintenease-600 hover:bg-maintenease-700 ml-auto">Save Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsTab;
