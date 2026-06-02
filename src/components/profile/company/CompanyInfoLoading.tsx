
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CompanyInfoLoading: React.FC = () => {
  return (
    <Card className="bg-card border border-border rounded-lg shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-headline text-xl text-foreground">Company Information</CardTitle>
        <CardDescription className="text-muted-foreground">Loading your organization details...</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="flex-grow space-y-4 w-full">
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
