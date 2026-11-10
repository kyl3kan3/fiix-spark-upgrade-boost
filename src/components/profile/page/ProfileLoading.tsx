
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const ProfileLoading: React.FC = () => {
 return (
 <DashboardLayout>
 <div className="container mx-auto px-4 py-8">
 <h1 className="font-display text-2xl md:text-[28px] font-bold leading-tight text-foreground mb-6">Profile & Settings</h1>
 <div className="animate-pulse space-y-4">
 <div className="h-12 bg-muted rounded"></div>
 <div className="h-64 bg-muted rounded"></div>
 </div>
 </div>
 </DashboardLayout>
 );
};
