
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <Card role="status" aria-live="polite" aria-busy="true">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Loading your profile information...</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-6">
        <div>
          <Skeleton className="w-24 h-24 rounded-full mb-2" aria-label="Profile avatar loading" />
          <Skeleton className="w-20 h-6" aria-label="User name loading" />
          <Skeleton className="w-24 h-4 mt-2" aria-label="Email loading" />
        </div>
        <div className="w-full space-y-4">
          <Skeleton className="h-8 w-48" aria-label="Name field loading" />
          <Skeleton className="h-8 w-48" aria-label="Email field loading" />
          <Skeleton className="h-8 w-36" aria-label="Phone field loading" />
        </div>
      </CardContent>
    </Card>
  );
};
