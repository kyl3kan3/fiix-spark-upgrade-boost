
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <Card
      className="bg-card border border-border rounded-lg shadow-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-headline text-xl text-foreground">User Profile</CardTitle>
        <CardDescription className="text-muted-foreground">
          Loading your profile information...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-6 pt-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-24 h-24 rounded-full" aria-label="Profile avatar loading" />
          <Skeleton className="w-20 h-6" aria-label="User name loading" />
          <Skeleton className="w-24 h-4" aria-label="Email loading" />
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
