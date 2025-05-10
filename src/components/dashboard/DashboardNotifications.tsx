
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

const DashboardNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const notifications = [
    {
      id: 1,
      title: "Work Order Updated",
      description: "WO-2023-154 status changed to In Progress",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Maintenance Alert",
      description: "Scheduled maintenance for Line A is due tomorrow",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "System Update",
      description: "New features have been added to the system",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      title: "Inventory Alert",
      description: "Low inventory for replacement filters",
      time: "Yesterday",
      read: true,
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
      )}
      
      <div 
        className={`fixed right-4 top-20 z-50 w-full max-w-sm transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <Card className="shadow-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-maintenease-500 mr-2" />
              <h3 className="font-medium">Notifications</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No new notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b last:border-0 hover:bg-gray-50 ${
                      notification.read ? "" : "bg-blue-50/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t flex justify-between">
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DashboardNotifications;
