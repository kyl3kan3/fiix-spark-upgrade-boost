
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import PageContainer from "@/components/shell/PageContainer";
import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";

const ProfilePage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const { isAuthenticated, isLoading: authLoading, user } = useAuth();
 const [refreshKey, setRefreshKey] = useState(0);

 // Extract the tab from the URL search params
 const searchParams = new URLSearchParams(location.search);
 const tabParam = searchParams.get('tab');
 const [activeTab, setActiveTab] = useState(tabParam === 'settings' ? 'settings' : 'profile');

 // Update URL when tab changes without page reload
 const handleTabChange = (value: string) => {
 setActiveTab(value);
 const newUrl = value === 'settings' ? '/profile?tab=settings' : '/profile';
 navigate(newUrl, { replace: true });
 };

 // Handle refreshing the profile data
 const handleRefresh = async () => {
 setRefreshKey(prev => prev + 1);
 toast.info("Profile data refreshed");
 };

 // Show loading while checking authentication
 if (authLoading) {
 return (
 <DashboardLayout>
 <PageContainer className="space-y-8">
 <BackToDashboard />
 <div>
 <Skeleton className="h-9 w-64 mb-2" />
 <Skeleton className="h-5 w-80" />
 </div>
 <div className="space-y-4">
 <Skeleton className="h-12 w-72 rounded-lg" />
 <Skeleton className="h-64 rounded-lg" />
 </div>
 </PageContainer>
 </DashboardLayout>
 );
 }

 // Redirect to auth if not authenticated
 if (!isAuthenticated || !user) {
 navigate("/auth", { replace: true });
 return null;
 }

 return (
 <DashboardLayout>
 <PageContainer className="space-y-8">
 <BackToDashboard />

 {/* Page Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
 <User className="h-8 w-8" />
 Profile &amp; Settings
 </h1>
 <p className="text-base text-muted-foreground mt-1">
 Manage your personal information and preferences.
 </p>
 </div>
 <Button variant="outline" size="sm" onClick={handleRefresh} className="border-border text-primary hover:bg-primary/5">
 <RefreshCw className="h-4 w-4 mr-2" />
 Refresh
 </Button>
 </div>

 <ProfileTabs
 activeTab={activeTab}
 onTabChange={handleTabChange}
 refreshKey={refreshKey}
 />
 </PageContainer>
 </DashboardLayout>
 );
};

export default ProfilePage;
